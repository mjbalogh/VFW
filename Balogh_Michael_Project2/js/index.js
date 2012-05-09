(function(ns, $, undefined) {
	// private
	var loadCounts = function () {
		var array = [], len = ns.langs.length;
		for (var i = 0; i < len; i++) {
			var count = 0, lang = ns.langs[i];
			if (lang in localStorage) {
				var snippets = JSON.parse(localStorage.getItem(lang));
				count = snippets.length;
			}
			if (count !== undefined && count > 0) {
				array.push({name: lang, count: count});
			}
		}
		return array;
	};
	var populateSnippetsList = function () {
		var langs = loadCounts(),
			list = $('snippet_list');
		if (langs.length === 0) {
			var item = document.createElement('li');
			item.id = 'greyed';
			item.innerHTML = "Click the '<strong>&#10010;</strong>' to add your first snippet.";
			list.appendChild(item);
		} else {
			for (var i = 0, len = langs.length; i < len; i++) {
				var lang = langs[i];
					item = document.createElement('li');// ,
				item.id = lang.name;
				// FIXME: there must be a better way
				// :after content in li doesn't show in iphone simulator, so include it in the actual content instead.
				item.innerHTML = lang.name + ' (' + lang.count.toString() + ')';
				item.addEventListener('click', ns.liClick);
				list.appendChild(item);
			}
		}
	};

	// public
	ns.liClick = function () {
		ns.renderSnippetsByLang(this.id);
		$('snippets_header').innerHTML = this.id + ' Snippets';
		$('snippets').style.top = $('h1header').offsetHeight + 'px';
		$('snippets_popup').style.display = "block";
	};
	ns.initPage = function () {
		populateSnippetsList();
	};
} (window.vfw = window.vfw || {}, function(element) { return document.getElementById(element); }));
try {
	document.addEventListener('DOMContentLoaded', vfw.initPage);
} catch (e) {
	console.log(e.message, 'in file', e.fileName, 'on line', e.lineNumber);
}