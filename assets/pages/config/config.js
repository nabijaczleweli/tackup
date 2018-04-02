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


function validate_config(config) {
	if(typeof config !== "object" || typeof config.interval !== "number")
		config = DEFAULT_CONFIG;

	return config;
}


window.addEventListener("load", () => {
	const INTERVAL_INPUT = document.getElementById("interval");
	const CONFIG_FORM    = document.getElementById("config-form");

	browser.storage.local.get("config").then(out => INTERVAL_INPUT.value = validate_config(out.config).interval, err => {
		INTERVAL_INPUT.value = DEFAULT_CONFIG.interval;
		console.log("Configuration acquisition error:", err);
	});

	CONFIG_FORM.addEventListener("submit", ev => {
		ev.preventDefault();
		browser.storage.local.set({config: {interval: parseInt(INTERVAL_INPUT.value)}})
		    .then(() => console.log("Config set!"), err => console.log("Configuration setting error:", err));
	});
});

browser.storage.local.get("config").then(out => console.log(out));
