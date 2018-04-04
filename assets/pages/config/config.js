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


const DEFAULT_CONFIG = {
	interval: 10 * 60 * 1000
};

const LN_KIB = Math.log(1024);


function validate_config(config) {
	if(typeof config !== "object" || typeof config.interval !== "number")
		config = DEFAULT_CONFIG;

	return config;
}

/// Construct string representing a human-readable size.
///
/// Stolen and adapted from https://github.com/thecoshman/http/blob/74743af027818b7b17b710e07a9db28c78feaf02/src/util/mod.rs#L212-L235,
/// which itself was stolen, adapted and inlined from [fielsize.js](http://filesizejs.com).
function human_readable_size(num) {
	if(num == 0)
		return "0 B";
	else {
		let exp = Math.min(Math.max(Math.floor(Math.log(num) / LN_KIB), 0), 8);

		let val = num / Math.pow(2, exp * 10);

		let ret;
		if(exp > 0) {
			ret = Math.round(val * 10) / 10;
		} else {
			ret = Math.round(val);
		}
		return ret + " " + ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"][Math.floor(Math.max(exp, 0))];
	}
}


window.addEventListener("load", () => {
	const INTERVAL_INPUT       = document.getElementById("interval");
	const CONFIG_FORM          = document.getElementById("config-form");
	const BYTES_USED           = document.getElementById("bytes-used");
	const BYTES_USED_CONTAINER = document.getElementById("bytes-used-container");

	browser.storage.local.get("config").then(out => INTERVAL_INPUT.value = validate_config(out.config).interval, err => {
		INTERVAL_INPUT.value = DEFAULT_CONFIG.interval;
		console.log("Configuration acquisition error:", err);
	});

	CONFIG_FORM.addEventListener("submit", ev => {
		ev.preventDefault();
		browser.storage.local.set({config: {interval: parseInt(INTERVAL_INPUT.value)}})
		    .then(() => console.log("Config set!"), err => console.log("Configuration setting error:", err));
	});

	if(browser.storage.local.getBytesInUse) {
		BYTES_USED_CONTAINER.hidden = false;
		browser.storage.local.getBytesInUse(null).then(bs => BYTES_USED.innerText = human_readable_size(bs),
		                                               err => BYTES_USED.innerHTML = `<strong>error getting bytes used: ${err}</strong>`)
	}
});
