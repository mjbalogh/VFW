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
	var render_help_message = function (list) {
		var item = document.createElement('li');
		if (list.nodeName !== 'UL' && list.nodeName !== 'OL') {
			console.log("render_help_message: element is not a list!");
			return;
		}
		item.id = 'greyed';
		item.innerHTML = "Click the '<strong>&#10010;</strong>' to add your first snippet.";
		list.appendChild(item);
	};
	var populate_snippets_list = function () {
		var langs = load_counts(),
			list = $('snippet_list');
		if (langs.length === 0) {
			// var item = document.createElement('li');
			// 			item.id = 'greyed';
			// 			item.innerHTML = "Click the '<strong>&#10010;</strong>' to add your first snippet.";
			// 			list.appendChild(item);
			render_help_message(list);
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
						div1.innerHTML = snippet.details[key];
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
		if (load_counts().length === 0) {
			var snippets_div = $('snippets'),
				list = document.createElement('ul');
			render_help_message(list);
			snippets_div.appendChild(list);
		} else {
			for (var i = 0, len = snippet_langs.length; i < len; i++) {
				render_snippets_by_language(snippet_langs[i], true);
			}
		}
		
		$('h1header').innerHTML = "All Snippets"
		if (get_page_name() === 'add_item.html') {
			$('back_icon').style.display = "none";
			$('add_icon').style.display = "inline";
			$('h2header').style.display = "none";
		}
		$('close_icon').style.display = "inline";
		$('snippets_popup').style.display = "block";
	};
	var clearAll = function () {
		if (confirm("Are you sure?\n\nYou will not be able to recover the data you are about to erase.")) {
			window.localStorage.clear(); // don't really care if it's empty or not.
			window.location.reload();
		}
	};
	var navigate = function () {
		(this.id === "add_icon") ? window.location.assign("add_item.html") : window.location.assign("index.html");
	};
	var closePopup = function () {
		$('snippets_popup').style.display = "none";
		$('h1header').innerHTML = 'My Snippets';
		$('close_icon').style.display = "none";
		if (get_page_name() === 'add_item.html') {
			$('add_icon').style.display = "none";
			$('back_icon').style.display = "inline";
			$('h2header').style.display = "block";
		}
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
				"favorite": (($('favorite').checked) ? "Yes" : "No")
			},
			"snippet": $('snippet').value
		};
		snippets.push(snippet);
		localStorage.setItem(language.toString(), JSON.stringify(snippets));
		
		alert(snippet.details.name + " saved.");
		return false;
	};
	var expandSnippet = function () {
		var hidden = $('hidden_' + this.id);
		(hidden.style.display === "none") ? hidden.style.display = "block" : hidden.style.display = "none";
	};
	var clickListItem = function () {
		render_snippets_by_language(this.id);
		$('h1header').innerHTML = this.id + ' Snippets';
		$('close_icon').style.display = "inline";
		$('snippets_popup').style.display = "block";
	};
		
	//public
	ns.initialize = function () {
		// add event listeners
		$('close_icon').addEventListener('click', closePopup);
		$('add_icon').addEventListener('click', navigate);
		$('show_all').addEventListener('click', showAll);
		$('clear_all').addEventListener('click', clearAll);
		
		// fixup the top location of content and snippet_popup areas.
		$('content').style.top = $('h1header').offsetHeight + 'px';
		$('snippets_popup').style.top = $('h1header').offsetHeight + 'px';
		
		// handle per-page setup
		if (get_page_name() === 'index.html') {
			populate_snippets_list();
		} else {
			// add event listeners
			$('back_icon').addEventListener('click', navigate);
			$('submit').addEventListener('click', saveData);
			
			populate_select();
			
			// fixup padding of content area
			$('content').style.paddingTop = $('h2header').offsetHeight + 'px';
			
			// hide add_icon until needed
			$('add_icon').style.display = "none";
			
			// hide/show the sub-header when the snippet textarea is being edited for visibility
			$('snippet').addEventListener('focus', function() { 
				$('h2header').style.display = "none";
				$('footer').style.display = "none";
			});
			$('snippet').addEventListener('blur', function() {
				$('h2header').style.display = "block";
				$('footer').style.bottom = 0;
				$('footer').style.display = "block";
			});
		}
	};
} (window.vfw = window.vfw || {}, function(element) { return document.getElementById(element); }));

try {
	document.addEventListener("DOMContentLoaded", vfw.initialize, false);
} catch (e) {
	console.log(e.message, 'in file', e.fileName, 'on line', e.lineNumber);
}
