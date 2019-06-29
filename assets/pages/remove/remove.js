// The MIT License (MIT)

// Copyright (c) 2019 nabijaczleweli

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


function remove_backups(timestamps, container) {
	browser.storage.local.remove(timestamps)
	    .then(()  => console.log("Successfully removed tabsets:",
                              typeof timestamps === "string" ? timestamps : timestamps.reduce((acc, cur, idx) => acc + (idx === 0 ? "" : ", ") + cur, "")),
	          err => container.innerHTML = `<strong>Failed to remove tabsets: ${err}</strong>`)
}


window.addEventListener("load", () => {
	const REMOVE_ONE_BUTTON       = document.getElementById("remove-one-button");
	const REMOVE_ALL_BUTTON       = document.getElementById("remove-all-button");
	const TABSET_COUNT            = document.getElementById("tabset-count");
	const TABSET_SELECT_CONTAINER = document.getElementById("tabset-select-container");
	const TIMESTAMP_SELECT        = document.getElementsByName("timestamp-select")[0];

	browser.storage.local.get(null).then(data => {
		let timestamps = Object.keys(data).sort().reverse();

		let config_idx = timestamps.indexOf("config");
		if(config_idx !== -1)
			timestamps.splice(config_idx, 1);  // JS is a good and intuitive language where the way to remove an array element is obviously via splice()

		let update_timestamp_list = () => TIMESTAMP_SELECT.innerHTML =
		    timestamps.reduce((acc, val) => acc + `<option value="${val}">${val} - ${data[val].length} tab${data[val].length !== 1 ? "s" : ""}</option>\n`, "");
		update_timestamp_list();
		TABSET_COUNT.innerText = timestamps.length;

		REMOVE_ONE_BUTTON.addEventListener("click", () => {
			if(data[TIMESTAMP_SELECT.value] !== undefined) {
				let timestamp_idx = timestamps.indexOf(TIMESTAMP_SELECT.value);
				if(timestamp_idx !== -1) {
					remove_backups(TIMESTAMP_SELECT.value);

					timestamps.splice(timestamp_idx, 1);  // JS is a good and intuitive language where the way to remove an array element is obviously via splice()
					update_timestamp_list();

					TIMESTAMP_SELECT.value = timestamps[timestamp_idx === 0 ? 0 : timestamp_idx - 1];
					TABSET_COUNT.innerText = timestamps.length;
				}
			}
		});

		REMOVE_ALL_BUTTON.addEventListener("click", () => {
			remove_backups(timestamps);
			timestamps = [];
			update_timestamp_list();
			TIMESTAMP_SELECT.innerHTML = "<option>None left!</option>";
			TABSET_COUNT.innerText = 0;
		});

		RESTORE_CONFIG.addEventListener("change", () => restore(RESTORE_CONFIG, RESTORE_CONFIG_STATUS, false));
		RESTORE_CONFIG_AND_TABSETS.addEventListener("change", () => restore(RESTORE_CONFIG_AND_TABSETS, RESTORE_CONFIG_AND_TABSETS_STATUS, true));
	}, err => TABSET_SELECT_CONTAINER.innerHTML = `<strong>Failed to acquire tabsets: ${err}</strong>`);
});
