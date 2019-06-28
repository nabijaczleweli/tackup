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

const LN_KIB           = Math.log(1024);
const HUMAN_TIME_TABLE = [
	[1000, "s"],
	[60, "min."],
	[60, "h"],
	[24, "d."],
];


function validate_config(config) {
	if(typeof config !== "object" || typeof config.interval !== "number")
		config = DEFAULT_CONFIG;

	if(!((typeof config.autodelete_maxage === "object" && config.autodelete_maxage === null) ||
	     (typeof config.autodelete_maxage === "number" && config.autodelete_maxage > 0)))
		config.autodelete_maxage = DEFAULT_CONFIG.autodelete_maxage;

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

/// Get a human-consumable approximation of a `[count, unit]` pair from the specified millisecond count.
function human_readable_time(ms) {
	let next_human_idx = 0;
	let time           = [ms, "ms"];
	while(next_human_idx < HUMAN_TIME_TABLE.length && time[0] % HUMAN_TIME_TABLE[next_human_idx][0] < ((time[0] / HUMAN_TIME_TABLE[next_human_idx][0]) * 0.25)) {
		let new_human = HUMAN_TIME_TABLE[next_human_idx];
		time[0]       = Math.round(time[0] / new_human[0]);
		time[1]       = new_human[1];
		++next_human_idx;
	}
	return time;
}

function unit_handler(input, unit, with_unit, unit_container) {
	return () => {
		let interval = parseInt(input.value);
		if(!isNaN(interval)) {
			let time = human_readable_time(interval);
			// console.log(time, time[1] == "ms", time[1] === "ms");
			if(time[1] != "ms") {
				unit.innerText        = time[1];
				with_unit.innerText   = time[0];
				unit_container.hidden = false;
				return;
			}
		}

		unit_container.hidden = true;
	};
}


window.addEventListener("load", () => {
	const INTERVAL_INPUT                   = document.getElementById("interval");
	const AUTODELETE_INPUT                 = document.getElementById("autodelete");
	const AUTODELETE_MAXAGE_INPUT          = document.getElementById("autodelete-maxage");
	const CONFIG_FORM                      = document.getElementById("config-form");
	const BYTES_USED                       = document.getElementById("bytes-used");
	const BYTES_USED_CONTAINER             = document.getElementById("bytes-used-container");
	const INTERVAL_UNIT                    = document.getElementById("interval-unit");
	const INTERVAL_WITH_UNIT               = document.getElementById("interval-with-unit");
	const INTERVAL_UNIT_CONTAINER          = document.getElementById("interval-unit-container");
	const AUTODELETE_MAXAGE_CONTAINER      = document.getElementById("autodelete-maxage-container");
	const AUTODELETE_MAXAGE_UNIT           = document.getElementById("autodelete-maxage-unit");
	const AUTODELETE_MAXAGE_WITH_UNIT      = document.getElementById("autodelete-maxage-with-unit");
	const AUTODELETE_MAXAGE_UNIT_CONTAINER = document.getElementById("autodelete-maxage-unit-container");


	let load_config = loaded_config => {
		INTERVAL_INPUT.value          = loaded_config.interval;
		AUTODELETE_INPUT.checked      = loaded_config.autodelete_maxage !== null;
		AUTODELETE_MAXAGE_INPUT.value = loaded_config.autodelete_maxage || loaded_config.interval * 100;

		INTERVAL_INPUT.dispatchEvent(new CustomEvent("change", {}));
		AUTODELETE_INPUT.dispatchEvent(new CustomEvent("change", {}));
		AUTODELETE_MAXAGE_INPUT.dispatchEvent(new CustomEvent("change", {}));
	};
	browser.storage.local.get("config").then(
	    out => {
		    load_config(validate_config(out.config));
	    },
	    err => {
		    load_config(DEFAULT_CONFIG);
		    console.log("Configuration acquisition error:", err);
	    });


	let human_interval_update_handler = unit_handler(INTERVAL_INPUT, INTERVAL_UNIT, INTERVAL_WITH_UNIT, INTERVAL_UNIT_CONTAINER);
	INTERVAL_INPUT.addEventListener("keyup", human_interval_update_handler);
	INTERVAL_INPUT.addEventListener("change", human_interval_update_handler);

	let human_autodelete_maxage_update_handler =
	    unit_handler(AUTODELETE_MAXAGE_INPUT, AUTODELETE_MAXAGE_UNIT, AUTODELETE_MAXAGE_WITH_UNIT, AUTODELETE_MAXAGE_UNIT_CONTAINER);
	AUTODELETE_MAXAGE_INPUT.addEventListener("keyup", human_autodelete_maxage_update_handler);
	AUTODELETE_MAXAGE_INPUT.addEventListener("change", human_autodelete_maxage_update_handler);


	AUTODELETE_INPUT.addEventListener("change", () => {
		AUTODELETE_MAXAGE_INPUT.disabled = !AUTODELETE_INPUT.checked;

		if(!AUTODELETE_INPUT.checked)
			AUTODELETE_MAXAGE_CONTAINER.classList.add("disabled");
		else
			AUTODELETE_MAXAGE_CONTAINER.classList.remove("disabled");
	});


	CONFIG_FORM.addEventListener("submit", ev => {
		ev.preventDefault();
		browser.storage.local
		    .set({config: {interval: parseInt(INTERVAL_INPUT.value), autodelete_maxage: AUTODELETE_INPUT.checked ? parseInt(AUTODELETE_MAXAGE_INPUT.value) : null}})
		    .then(() => console.log("Config set!"), err => console.log("Configuration setting error:", err));
	});


	if(browser.storage.local.getBytesInUse) {
		BYTES_USED_CONTAINER.hidden = false;
		browser.storage.local.getBytesInUse(null).then(bs => BYTES_USED.innerText = human_readable_size(bs),
		                                               err => BYTES_USED.innerHTML = `<strong>error getting bytes used: ${err}</strong>`)
	}
});
