(function(ns, $, undefined) {
	//private
	var populateSelect = function () {
		var select = $('language'),
			len = ns.langs.length;
		for (var i = 0; i < len; i++) {
			var option = document.createElement('option'),
				language = ns.langs[i];
			option.value = language
			option.innerHTML = language;
			select.appendChild(option);
		}
	};
	
	//public
	ns.saveData = function () {
		var language = $('language').value,
			snippets = [], snippet = {};
		if (language in localStorage) {
			snippets = JSON.parse(localStorage.getItem(language));
		}
		snippet = {
			"details": {
				"id": new Date().getTime(),
				"name": $('name').value,
				"added_on": $('added_on').value,
				"relevance": $('relevance').value,
				"favorite": $('favorite').value
			},
			"snippet": $('snippet').value
		};
		snippets.push(snippet);
		localStorage.setItem(language.toString(), JSON.stringify(snippets));
		return false;
	};
	ns.initPage = function () {
		populateSelect();
		$('submit').addEventListener('click', ns.saveData);
	};
} (window.vfw = window.vfw || {}, function(element) { return document.getElementById(element); }));

try {
	document.addEventListener("DOMContentLoaded", vfw.initPage);
} catch (e) {
	console.log(e.message, 'in file', e.fileName, 'on line', e.lineNumber);
}