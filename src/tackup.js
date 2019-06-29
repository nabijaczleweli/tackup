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
	interval: 10 * 60 * 1000,
	autodelete_maxage: null,  // null for unset=never, number > 0 for max age of backup to remove on backup run
};


function setup_interval(now_d) {
	let setup = config => {
		if(typeof config === "object")
			config = config.config;
		if(typeof config !== "object" || typeof config.interval !== "number")
			config = DEFAULT_CONFIG;
		if(!((typeof config.autodelete_maxage === "object" && config.autodelete_maxage === null) ||
		     (typeof config.autodelete_maxage === "number" && config.autodelete_maxage > 0)))
			config.autodelete_maxage = DEFAULT_CONFIG.autodelete_maxage;


		if(config.autodelete_maxage !== null) {
			let now = now_d.toISOString();

			let max_timestamp_d = new Date(now_d - config.autodelete_maxage);
			let max_timestamp   = max_timestamp_d.toISOString();

			browser.storage.local.get(null).then(data => {
				let timestamps = Object.keys(data).sort().reverse();
				let to_remove  = [];

				for(let i = timestamps.length - 1; i >= 0; --i) {
					let timestamp = timestamps[i];
					if(timestamp === "config")
						continue;

					if(new Date(timestamp) < max_timestamp_d)
						to_remove.push(timestamp);
				}

				if(to_remove.length === 0)
					console.log("[tackup]", now, "No tabsets older than", config.autodelete_maxage, "ms (", max_timestamp, ") found");
				else {
					browser.storage.local.remove(to_remove).then(()  => console.log("[tackup]", now, "Removed", to_remove.length, " tabsets older than ", max_timestamp,
                                                                         config.autodelete_maxage, "ms (", max_timestamp,
                                                                         "): ", to_remove.reduce((acc, cur, idx) => acc + (idx === 0 ? "" : ", ") + cur, "")),
					                                             err => console.log("[tackup]", now, "Failed to remove", to_remove.length, " tabsets older than ",
					                                                                max_timestamp, config.autodelete_maxage, "ms (", max_timestamp, "): ", err))
				}
			}, err => console.log("[tackup]", now, "Failed to enumerate tabsets older than ", max_timestamp, "ms (", max_timestamp, "): ", err));
		}


		console.log("[tackup]", "Saving again in", config.interval, "ms");
		setTimeout(tab_event_callback, config.interval);
	};

	browser.storage.local.get("config").then(setup, setup);
}

function tab_event_callback() {
	let now_d = new Date();
	let now   = now_d.toISOString();

	browser.tabs.query({}).then(tabs => {
		let data  = {};
		data[now] = tabs.map(tab => ({title: tab.title, url: tab.url, private: tab.incognito}));

		browser.storage.local.set(data).then(()     => console.log("[tackup]", now, "Successfully saved", tabs.length, "tabs"),
		                                     reason => console.log("[tackup]", now, "Failed to save", tabs.length, "tabs:", reason));

		setup_interval(now_d);
	});
}


tab_event_callback();
