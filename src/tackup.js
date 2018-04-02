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


function setup_interval(config) {
	let setup = config => {
		if(typeof config !== "object")
			config = config.config;
		if(typeof config !== "object" || typeof config.interval !== "number")
			config = DEFAULT_CONFIG;

		console.log("[tackup]", "Saving again in", config.interval, "ms");
		setTimeout(tab_event_callback, config.interval);
	};

	browser.storage.local.get("config").then(setup, setup);
}

function tab_event_callback() {
	let now = (new Date()).toISOString();

	browser.tabs.query({}).then(tabs => {
		let data  = {};
		data[now] = tabs.map(tab => ({title: tab.title, url: tab.url, private: tab.incognito}));

		browser.storage.local.set(data).then(()     => console.log("[tackup]", now, "Successfully saved", tabs.length, "tabs"),
		                                     reason => console.log("[tackup]", now, "Failed to save", tabs.length, "tabs:", reason));

		setup_interval();
	});
}


tab_event_callback();
