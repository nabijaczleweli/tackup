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
	no_repeat_freshest: false,
};


function validate_config(config) {
	if(typeof config !== "object")
		config = DEFAULT_CONFIG;

	if(typeof config.interval !== "number")
		config.interval = DEFAULT_CONFIG.interval;

	if(!((typeof config.autodelete_maxage === "object" && config.autodelete_maxage === null) ||
	     (typeof config.autodelete_maxage === "number" && config.autodelete_maxage > 0)))
		config.autodelete_maxage = DEFAULT_CONFIG.autodelete_maxage;

	if(typeof config.no_repeat_freshest !== "boolean")
		config.no_repeat_freshest = DEFAULT_CONFIG.no_repeat_freshest;

	return config;
}

function setup_interval(config, now_d) {
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
				browser.storage.local.remove(to_remove).then(()  => console.log("[tackup]", now, "Removed", to_remove.length, "tabsets older than",
                                                                       config.autodelete_maxage, "ms (", max_timestamp,
                                                                       "): ", to_remove.reduce((acc, cur, idx) => acc + (idx === 0 ? "" : ", ") + cur, "")),
				                                             err => console.log("[tackup]", now, "Failed to remove", to_remove.length, "tabsets older than",
				                                                                config.autodelete_maxage, "ms (", max_timestamp, "): ", err))
			}
		}, err => console.log("[tackup]", now, "Failed to enumerate tabsets older than ", max_timestamp, "ms (", max_timestamp, "): ", err));
	}

	console.log("[tackup]", "Potentially saving again in", config.interval, "ms");
	setTimeout(tab_event_callback, config.interval);
}

/// https://stackoverflow.com/a/19494146/2851815
function arr_eq(lhs, rhs) {
	return lhs && rhs &&                //
	       lhs.length == rhs.length &&  //
	       lhs.every((lelem, i) => {
		       let relem = rhs[i];

		       return Object.keys(lelem).every(key => lelem[key] == relem[key]);
	       });
}

function tab_event_callback() {
	let now_d = new Date();
	let now   = now_d.toISOString();

	browser.tabs.query({}).then(tabs => {
		let data      = {};
		data[now]     = tabs.map(tab => ({title: tab.title, url: tab.url, private: tab.incognito}));
		data.freshest = now;

		let maybe_save = cf => {
			let config = validate_config(cf.config);

			let save_and_continue = save => {
				if(save)
					browser.storage.local.set(data).then(()     => console.log("[tackup]", now, "Successfully saved", tabs.length, "tabs"),
					                                     reason => console.log("[tackup]", now, "Failed to save", tabs.length, "tabs:", reason));
				else
					console.log("[tackup]", now, "Current tabset equivalent to", cf.freshest, "– not saving")

					setup_interval(config, now_d);
			};

			if(config.no_repeat_freshest) {
				if(cf.freshest)
					browser.storage.local.get(cf.freshest)
					    .then(
					        freshest_tabset => {
						        save_and_continue(!arr_eq(freshest_tabset[cf.freshest], data[now]));
					        },
					        err => {
						        console.log("[tackup]", now, "Couldn't find freshest tabset:", err);
						        save_and_continue(true);
					        });
				else {
					console.log("[tackup]", now, "Couldn't find freshest key and no_repeat_freshest specified");
					save_and_continue(true);
				}
			} else
				save_and_continue(true);
		};

		browser.storage.local.get(["config", "freshest"]).then(maybe_save, maybe_save);
	});
}


tab_event_callback();
