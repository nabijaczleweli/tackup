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

	browser.storage.local.get(null).then(data => {
		delete data.config;

		let timestamps         = Object.keys(data).sort().reverse();
		TABSET_COUNT.innerText = timestamps.length;
		TIMESTAMP_SELECT.innerHTML =
		    timestamps.reduce((acc, val) => acc + `<option value="${val}">${val} - ${data[val].length} tab${data[val].length !== 1 ? "s" : ""}</option>\n`, "");

		TABSET_TABLE.hidden     = false;
		let tabset_table_header = TABSET_TABLE.innerHTML;

		TIMESTAMP_SELECT.addEventListener("change", () => {
			let quote_escaped      = encodeURIComponent('"');
			TABSET_TABLE.innerHTML = data[TIMESTAMP_SELECT.value].reduce(
			    (acc, val) =>
			        acc +
			        `<tr><td ${val.private ? "class=\"private\"" : ""}></td> <td><a href="${
					                                                                            val.url.replace("\"", quote_escaped)
					                                                                          }">${val.title.replace("<", "&lt;").replace(">", "&gt;")}</a></td></tr>\n`,
					tabset_table_header);
		});
		TIMESTAMP_SELECT.dispatchEvent(new CustomEvent("change", {}));
	}, err => TABSET_SELECT_CONTAINER.innerHTML = `<strong>Failed to acquire tabsets: ${err}</strong>`);
});
