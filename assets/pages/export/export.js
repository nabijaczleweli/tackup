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


function download_backup(data, count, timestamp) {
	let has_config = data.config !== undefined;
	let blob       = new Blob([JSON.stringify(data)], {type: "application/json;charset=utf8"});
	let link       = document.createElement("a");

	link.href     = URL.createObjectURL(blob);
	link.download = `tackup-${timestamp}-${count}${has_config ? "+c" : ""}.json`;
	link.type = blob.type;

	document.body.appendChild(link);
	link.click();
}


window.addEventListener("load", () => {
	const DOWNLOAD_ONE_BUTTON        = document.getElementById("download-one-button");
	const DOWNLOAD_ALL_BUTTON        = document.getElementById("download-all-button");
	const TABSET_COUNT               = document.getElementById("tabset-count");
	const TABSET_SELECT_CONTAINER    = document.getElementById("tabset-select-container");
	const TIMESTAMP_SELECT           = document.getElementsByName("timestamp-select")[0];

	browser.storage.local.get(null).then(data => {
		let timestamps = Object.keys(data).sort().reverse();

		let config_idx = timestamps.indexOf("config");
		if(config_idx !== -1)
			timestamps.splice(config_idx, 1);  // JS is a good and intuitive language where the way to remove an array element is obviously via splice()

		TABSET_COUNT.innerText     = timestamps.length;
		TIMESTAMP_SELECT.innerHTML = timestamps.reduce((acc, val) => acc + `<option value="${val}">${val} - ${data[val].length} tabs</option>`, "");

		DOWNLOAD_ONE_BUTTON.addEventListener("click", () => {
			if(data[TIMESTAMP_SELECT.value] !== undefined) {
				let smol_data                     = {};
				smol_data[TIMESTAMP_SELECT.value] = data[TIMESTAMP_SELECT.value];
				download_backup(smol_data, 1, TIMESTAMP_SELECT.value);
			}
		});

		DOWNLOAD_ALL_BUTTON.addEventListener("click", () => download_backup(data, timestamps.length, timestamps[timestamps.length - 1] + "-" + timestamps[0]));
	}, err => TABSET_SELECT_CONTAINER.innerHTML = `<strong>Failed to acquire tabsets: ${err}</strong>`);
});
