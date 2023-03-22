// The MIT License (MIT)

// Copyright (c) 2018 nabijaczleweli

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


const CONFIG_KEYS = ["interval", "autodelete_maxage", "no_repeat_freshest"];


function download_backup(data, count, timestamp) {
	let has_config = data.config !== undefined;
	let blob       = new Blob([JSON.stringify(data)], {type: "application/json;charset=utf8"});
	let link       = document.createElement("a");

	link.href     = URL.createObjectURL(blob);
	link.download = `tackup-${timestamp}-${count}${has_config ? "+c" : ""}.json`;
	link.type = blob.type;
	link.addEventListener("click", () => document.body.removeChild(link));

	document.body.appendChild(link);
	link.click();
}

function restore(input, status, tabsets, config) {
	let err = (action, e) => status.innerText = `Failed to ${action}: ${e.message}`;

	if(input.files.length !== 0) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
			let read;
			try {
				read = JSON.parse(reader.result);
			} catch(syntax_error) {
				err("parse file as JSON", syntax_error);
			}

			browser.storage.local.get("config").then(cfg => {
				if(cfg.config && typeof cfg.config === "object")
					cfg = cfg.config;
				else
					cfg = {};

				if(config && !read.config && !tabsets) {
					status.innerText = "No config in file.";
					return;
				}
				if(!read.config)
					config = false;

				if(read.config) {
					for(let key of CONFIG_KEYS)
						if(key in read.config)
							cfg[key] = read.config[key];
				}
				let freshest = read.freshest || undefined;
				delete read.config;
				delete read.freshest;

				let to_write = tabsets ? read : {};
				if(config) {
					to_write.config = cfg;
					if(freshest)
						to_write.freshest = freshest;
				}

				browser.storage.local.set(to_write).then(() => {
					status.innerText = `Successfully loaded ${tabsets ? "tabsets" : ""}${(tabsets && config) ? " and " : ""}${config ? "config" : ""}!`;
					if(tabsets)
						setTimeout(() => location.reload(), 1500);
					else
						setTimeout(() => status.innerText = "", 5280);
				}, e => err("saving config to localstorage", e))
			}, e => err("get config", e));
		});

		reader.addEventListener("fail", () => err("read file", reader.error));
		reader.readAsText(input.files[0]);

		input.value = "";
	}
}


window.addEventListener("load", () => {
	const DOWNLOAD_ONE_BUTTON               = document.getElementById("download-one-button");
	const DOWNLOAD_ONE_INCLUDE_CONFIG       = document.getElementById("download-one-include-config");
	const DOWNLOAD_ALL_BUTTON               = document.getElementById("download-all-button");
	const TABSET_COUNT                      = document.getElementById("tabset-count");
	const CONFIG_ADDITIVE                   = document.getElementById("config-additive");
	const TABSET_SELECT_CONTAINER           = document.getElementById("tabset-select-container");
	const RESTORE_CONFIG_AND_TABSETS        = document.getElementById("restore-config-and-tabsets");
	const RESTORE_CONFIG_AND_TABSETS_STATUS = document.getElementById("restore-config-and-tabsets-status");
	const RESTORE_WHAT                      = Array.from(document.querySelectorAll('input[name="restore-what"]'));
	const TIMESTAMP_SELECT                  = document.getElementsByName("timestamp-select")[0];
	const LOCAL_DATETIMES                   = document.getElementById("local-datetimes");

	browser.storage.local.get(null).then(data => {
		let timestamps = Object.keys(data).sort().reverse();

		let config_idx = timestamps.indexOf("config");
		if(config_idx !== -1) {
			CONFIG_ADDITIVE.hidden = false;
			timestamps.splice(config_idx, 1);  // JS is a good and intuitive language where the way to remove an array element is obviously via splice()
		}
		let freshest_idx = timestamps.indexOf("freshest");
		if(freshest_idx !== -1)
			timestamps.splice(freshest_idx, 1);  // JS is a good and intuitive language where the way to remove an array element is obviously via splice()

		TABSET_COUNT.innerText    = timestamps.length;
		let update_timestamp_list = () => TIMESTAMP_SELECT.innerHTML =
		    timestamps.length === 0 ? "<option>None found!</option>"
		                            : timestamps.reduce((acc, val) => acc + `<option value="${val}">${LOCAL_DATETIMES.checked ? new Date(val) : val} - ${
					                                                                  data[val].length} tab${data[val].length !== 1 ? "s" : ""}</option>\n`,
						                                        "");
		update_timestamp_list();

		DOWNLOAD_ONE_BUTTON.addEventListener("click", () => {
			if(data[TIMESTAMP_SELECT.value] !== undefined) {
				let smol_data                     = {};
				smol_data[TIMESTAMP_SELECT.value] = data[TIMESTAMP_SELECT.value];
				if(DOWNLOAD_ONE_INCLUDE_CONFIG.checked)
					if(data.config)
						smol_data.config = data.config;
				download_backup(smol_data, 1, TIMESTAMP_SELECT.value);
			}
		});

		DOWNLOAD_ALL_BUTTON.addEventListener("click", () => download_backup(data, timestamps.length, timestamps[timestamps.length - 1] + "-" + timestamps[0]));

		RESTORE_CONFIG_AND_TABSETS.addEventListener("change", () => {
			let what = RESTORE_WHAT.reduce((acc, val) => val.checked ? parseInt(val.value) : acc, 0);
			restore(RESTORE_CONFIG_AND_TABSETS, RESTORE_CONFIG_AND_TABSETS_STATUS, what & 1, what & 2)
		});

		LOCAL_DATETIMES.addEventListener("change", () => {
			let selected = TIMESTAMP_SELECT.value;
			update_timestamp_list();
			TIMESTAMP_SELECT.value = selected;
		});
	}, err => TABSET_SELECT_CONTAINER.innerHTML = `<strong>Failed to acquire tabsets: ${err}</strong>`);
});
