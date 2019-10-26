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


window.addEventListener("load", () => {
	const TABSET_COUNT            = document.getElementById("tabset-count");
	const TABSET_TABLE            = document.getElementById("tabset-table");
	const TABSET_TABLE_CONTENT    = document.getElementById("tabset-table-content");
	const TABSET_SELECT_CONTAINER = document.getElementById("tabset-select-container");
	const TIMESTAMP_SELECT        = document.getElementsByName("timestamp-select")[0];
	const LOCAL_DATETIMES         = document.getElementById("local-datetimes");
	const OPEN_SELECTED           = document.getElementById("open-selected");

	browser.storage.local.get(null).then(data => {
		delete data.config;
		delete data.freshest;

		let timestamps            = Object.keys(data).sort().reverse();
		TABSET_COUNT.innerText    = timestamps.length;
		let update_timestamp_list = () => TIMESTAMP_SELECT.innerHTML =
		    timestamps.length === 0 ? "<option>None found!</option>"
		                            : timestamps.reduce((acc, val) => acc + `<option value="${val}">${LOCAL_DATETIMES.checked ? new Date(val) : val} - ${
					                                                                  data[val].length} tab${data[val].length !== 1 ? "s" : ""}</option>\n`,
						                                        "");
		update_timestamp_list();

		TABSET_TABLE.hidden     = false;
		let tabset_table_header = TABSET_TABLE.innerHTML;

		TIMESTAMP_SELECT.addEventListener("change", () => {
			if(data[TIMESTAMP_SELECT.value] !== undefined) {
				let quote_escaped      = encodeURIComponent('"');
				TABSET_TABLE.innerHTML = data[TIMESTAMP_SELECT.value].reduce(
				    (acc, val) => acc + `<tr><td ${val.private ? "class=\"private\"" : ""}></td> <td><a href="${val.url.replace("\"", quote_escaped)}">${
							                      val.title.replace("<", "&lt;").replace(">", "&gt;")}</a></td> <td><input type="checkbox" class="select-box"></input></td></tr>\n`,
						tabset_table_header);

				document.getElementById("main-select-box").addEventListener("change", ev => {
					const MAIN_SELECT_BOX = ev.target;

					Array.from(document.getElementsByClassName("select-box")).forEach(select_box => select_box.checked = MAIN_SELECT_BOX.checked);
				});
			}
		});
		TIMESTAMP_SELECT.dispatchEvent(new CustomEvent("change", {}));

		LOCAL_DATETIMES.addEventListener("change", () => {
			let selected = TIMESTAMP_SELECT.value;
			update_timestamp_list();
			TIMESTAMP_SELECT.value = selected;
		});

		OPEN_SELECTED.addEventListener("click", () => {
			Array.from(document.getElementsByClassName("select-box")).forEach(select_box => {
				if(select_box.checked) {
					let url = select_box.parentElement.parentElement.children[1].firstElementChild.href;

					browser.tabs.create({
						active: false,
						url: url,
					}).then(() => {}, err => console.log("Couldn't open tab", url, "due to", err));
				}
			});
		});
	}, err => TABSET_SELECT_CONTAINER.innerHTML = `<strong>Failed to acquire tabsets: ${err}</strong>`);
});
