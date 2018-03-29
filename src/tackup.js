browser.tabs.query({}).then(tabs => {
	console.log(tabs.length);

	tabs.forEach((tab, i) => {
		console.log(i, tab.title, tab.url);
	});
});
