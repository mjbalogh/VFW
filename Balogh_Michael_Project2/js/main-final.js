(function(ns, $, undefined) {
	// private variables
	var snippet_langs = ['Bash', 'CSS', 'HTML', 'JavaScript', 'Perl', 'PHP', 'Python', 'Ruby'];
	
	// private functions
	var get_page_name = function () {
		var path = window.location.pathname;
		return path.substr(path.lastIndexOf('/') + 1);
	};
	var load_counts = function () {
		var array = [];
		for (var i = 0, len = snippet_langs.length; i < len; i++) {
			var lang = snippet_langs[i];
			if (lang in localStorage) {
				var snippets = JSON.parse(localStorage.getItem(lang)),
					count = snippets.length;

				if (count !== undefined && count > 0) {
					array.push({name: lang, count: count});
				}
			}
		}
		return array;
	};
	var populate_snippets_list = function () {
		var langs = load_counts(),
			list = $('snippet_list');
		if (langs.length === 0) {
			var item = document.createElement('li');
			item.id = 'greyed';
			item.innerHTML = "Click the '<strong>&#10010;</strong>' to add your first snippet.";
			list.appendChild(item);
		} else {
			for (var i = 0, len = langs.length; i < len; i++) {
				var lang = langs[i],
					item = document.createElement('li');
				
				item.id = lang.name;
				// FIXME: there must be a better way
				// :after content in li doesn't show (it does in label tags inside li, but not in spans or the like) 
				// in iphone simulator, so include it in the actual content instead.
				item.innerHTML = lang.name + ' (' + lang.count.toString() + ')';
				item.addEventListener('click', clickListItem);
				list.appendChild(item);
			}
		}
	};
	var populate_select = function () {
		var select = $('language');
		for (var i = 0, len = snippet_langs.length; i < len; i++) {
			var option = document.createElement('option'),
				language = snippet_langs[i];
			option.value = language;
			option.innerHTML = language;
			select.appendChild(option);
		}
	};
	var render_snippets_by_language = function (lang, showLegend) {
		if (lang in localStorage) {
			var snippets_div = $('snippets'),
				wrapper = document.createElement('ul'),
				snippets = JSON.parse(localStorage.getItem(lang));
			
			showLegend = showLegend || false;
			if (showLegend) {
				var legend = document.createElement('li'),
					span = document.createElement('span');
				legend.setAttribute("class", "legend");
				span.innerHTML = lang;
				legend.appendChild(span);
				wrapper.appendChild(legend);
			}
			
			// create area for each snippet
			for (var i = 0, len = snippets.length; i < len; i++) {
				var snippet = snippets[i],
					li = document.createElement('li'),
					name = document.createElement('div'),
					nspan = document.createElement('span'),
					hidden = document.createElement('div'),
					details = document.createElement('div'),
					dspan = document.createElement('span'),
					darea = document.createElement('div'),
					rpanel = document.createElement('div'),
					lpanel = document.createElement('div'),
					snip = document.createElement('div'),
					sspan = document.createElement('span'),
					sarea = document.createElement('div');
					
				li.id = snippet.details.id;
				li.addEventListener('click', expandSnippet);
				// name.id = "name_" + snippet.details.id;
				nspan.setAttribute("class", "full");
				nspan.innerHTML = snippet.details.name;
				name.appendChild(nspan);
				li.appendChild(name);
				
				// setup hidden div
				hidden.id = "hidden_" + snippet.details.id;
				hidden.style.display = "none";
				hidden.setAttribute("class", "hidden");
				
				// details section
				details.setAttribute("class", "legend");
				dspan.innerHTML = 'Details';
				details.appendChild(dspan);
				
				// setup right and left divs
				lpanel.setAttribute("class", "lpanel");
				rpanel.setAttribute("class", "rpanel");
				
				for (var key in snippet.details) {
					var div1 = document.createElement('div'),
						div2 = document.createElement('div');
						
						if (key === 'name' || key == 'id') continue;
						
						// setup the right span
						if (key !== "favorite") {
							div1.innerHTML = snippet.details[key];
						} else {
							div1.innerHTML = (snippet.details[key] === "on") ? 'Yes' : 'No';
						}
						rpanel.appendChild(div1);
						
						// setup the left span
						// replace '_' with a space, title case the string, and terminate it with a ':'
						div2.innerHTML = title_case(inline_replace(key, "_", " ")) + ':';
						lpanel.appendChild(div2);
				}
				details.appendChild(lpanel);
				details.appendChild(rpanel);
				hidden.appendChild(details);
				
				snip.setAttribute("class", "legend");
				sspan.innerHTML = "Snippet Code";
				snip.appendChild(sspan);
				hidden.appendChild(snip);
				
				sarea.setAttribute("class", "full");
				sarea.innerHTML = snippet.snippet;
				hidden.appendChild(sarea);
				li.appendChild(hidden);
				wrapper.appendChild(li);
			}
			snippets_div.appendChild(wrapper);
		}
	};

	// *** START ripped from SDI Project 4 ***
	// privately duck punch RegExp until it sounds like it contains a function to escape special characters
	RegExp.escape = function(str) {
		return str.replace(/[[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	var title_case = function (string) {
		// regexes to the rescue again. amazing how robust those little buggers are, isn't it?
		return string.replace(/\w\S*/g, function(text) { return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase(); });
	};
	var inline_replace = function (string, char1, char2) {
		var pattern = new RegExp(RegExp.escape(char1), "g");
		return string.replace(pattern, char2);
	};
	// *** END ripped from SDI Project 4 ***
		
	// event handlers
	var showAll = function () {
		for (var i = 0, len = snippet_langs.length; i < len; i++) {
			render_snippets_by_language(snippet_langs[i], true);
		}
		
		$('snippets_header').innerHTML = "All Snippets"
		$('snippets').style.top = $('h1header').offsetHeight + 'px';
		$('snippets_popup').style.display = "block";
	};
	var clearAll = function () {
		window.localStorage.clear(); // don't really care if it's empty or not.
		window.location.reload();
	};
	var navigate = function () {
		var page = get_page_name();
		(page === 'index.html') ? window.location.assign("add_item.html") : window.location.assign("index.html");
	};
	var closePopup = function () {
		$('snippets_popup').style.display = "none";
		$('snippets_header').innerHTML = '';
		$('snippets').innerHTML = '';
	};
	var saveData = function () {
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
	var expandSnippet = function () {
		var hidden = $('hidden_' + this.id);
		(hidden.style.display === "none") ? hidden.style.display = "block" : hidden.style.display = "none";
	};
	var clickListItem = function () {
		render_snippets_by_language(this.id);
		$('snippets_header').innerHTML = this.id + ' Snippets';
		$('snippets').style.top = $('h1header').offsetHeight + 'px';
		$('snippets_popup').style.display = "block";
	};
		
	//public
	ns.initialize = function () {
		// add event listeners
		$('show_all').addEventListener('click', showAll);
		$('icon').addEventListener('click', navigate);
		$('clear_all').addEventListener('click', clearAll);
		$('close').addEventListener('click', closePopup);
		
		// fixup the positioning of content area.
		$('content').style.top = $('h1header').offsetHeight + 'px';
		
		if (get_page_name() === 'index.html') {
			populate_snippets_list();
		} else {
			populate_select();
			$('content').style.paddingTop = $('h2header').offsetHeight + 'px';
			$('submit').addEventListener('click', saveData);
		}
	};
} (window.vfw = window.vfw || {}, function(element) { return document.getElementById(element); }));

try {
	document.addEventListener("DOMContentLoaded", vfw.initialize, false);
} catch (e) {
	console.log(e.message, 'in file', e.fileName, 'on line', e.lineNumber);
}
