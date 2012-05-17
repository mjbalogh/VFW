/*
	Project: 3
	Class: Visual Frameworks
	Term: 1205
	Author: Michael Balogh
*/
// normally I would just use jQuery instead of reinventing the wheel, but...
!function (window) {
	"use strict";

	var document = window.document,
		isId = /^\#([-\w]+)$/,
		isClass = /^\.([-\w]+)$/g,
		isTag = /^[-\w]+$/;

	// return single #id, or array containing .class or tag elements. use querySelectorAll if all else fails
	window.$ = function (selector, element) {
		var elements, selectors = [];
		element = element || document;

		if (element === document && isId.test(selector)) {
			return element.getElementById(RegExp.$1);
		} else {
			if (element.nodeType === 1 || element.nodeType === 9) {
				Array.prototype.slice.call(isClass.test(selector) ? element.getElementsByClassName(selector.replace(/\./g, '')) :
						isTag(selector) ? element.getElementsByTagName(RegExp.$1) : element.querySelectorAll(selector));
			}
		}
	};
}(window);

!function (ns, $, undefined) {
	"use strict";

	// private variables
	var snippet_langs = ['Bash', 'CSS', 'HTML', 'JavaScript', 'Perl', 'PHP', 'Python', 'Ruby'];
	
	// private functions
	function get_page_name () {
		var path = window.location.pathname;
		return path.substr(path.lastIndexOf('/') + 1);
	};
	function load_counts () {
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
	function render_help_message (list) {
		var item = document.createElement('li');
		if (list.nodeName !== 'UL' && list.nodeName !== 'OL') {
			throw "render_help_message: element is not a list!";
			return;
		}
		item.id = 'greyed';
		item.innerHTML = "Click the '<strong>&#10010;</strong>' to add your first snippet.";
		list.appendChild(item);
	};
	function populate_language_list () {
		var langs = load_counts(),
			list = $('#language_list');
		if (langs.length === 0) {
			render_help_message(list);
		} else {
			for (var i = 0, len = langs.length; i < len; i++) {
				var lang = langs[i],
					item = document.createElement('li');
				
				item.id = lang.name;
				item.setAttribute("data-count", lang.count.toString());
				item.setAttribute("class", "lang_item");
				item.innerHTML = lang.name + ' <em>(' + lang.count.toString() + ')</em>';
				item.addEventListener('click', clickListItem);
				list.appendChild(item);
			}
		}
	};
	function populate_select () {
		var select = $('#language');
		for (var i = 0, len = snippet_langs.length; i < len; i++) {
			var option = document.createElement('option'),
				language = snippet_langs[i];
			option.value = language;
			option.innerHTML = language;
			select.appendChild(option);
		}
	};
	function render_snippet (snippet, language) {
		var li = document.createElement('li'),
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
			// sarea = document.createElement('div'),
			stext = document.createElement('textarea'),
			barea = document.createElement('div'),
			bedit = document.createElement('button'),
			bdelete = document.createElement('button');
			
		if (snippet === null || snippet === undefined) {
				throw "render_snippet: snippet argument is null or undefined";
		}
		language = language || undefined;
		
		name.id = snippet.details.id
		name.addEventListener('click', expandSnippet)
		nspan.id = 'span_' + snippet.details.id;
		nspan.setAttribute("class", "item_closed");
		nspan.innerHTML = snippet.details.name;
		name.appendChild(nspan);
		li.appendChild(name);
				
		// setup hidden div
		hidden.id = "hidden_" + snippet.details.id;
		hidden.style.display = "none";
		hidden.setAttribute("class", "hidden");
		hidden.setAttribute("data-name", snippet.details.name);
		if (language !== undefined) {
			hidden.setAttribute("data-language", language)
		}
				
		// details section
		details.setAttribute("class", "legend");
		dspan.setAttribute("class", "snippet_details");
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
		sspan.setAttribute("class", "snippet_details");
		sspan.innerHTML = "Snippet Code";
		snip.appendChild(sspan);
		hidden.appendChild(snip);
				
		stext.setAttribute("class", "code")
		stext.rows = "8";
		stext.readOnly = "readonly";
		stext.innerHTML = snippet.codebase;
		hidden.appendChild(stext);
		
		barea.setAttribute("class", "actions");
		
		bedit.type = 'button';
		bedit.setAttribute("data-lang", language);
		bedit.setAttribute("data-id", snippet.details.id);
		bedit.addEventListener('click', editSnippet);
		bedit.innerHTML = 'Edit';
		barea.appendChild(bedit);
		
		bdelete.type = 'button';
		bdelete.className = 'bright';
		bdelete.setAttribute("data-lang", language);
		bdelete.setAttribute("data-id", snippet.details.id);
		bdelete.addEventListener('click', deleteSnippet);
		bdelete.innerHTML = 'Delete';
		barea.appendChild(bdelete);
		hidden.appendChild(barea);
		
		li.appendChild(hidden);
		
		return li;
	};
	function render_snippets_by_language (lang, showLegend) {
		if (lang in localStorage) {
			var snippets_div = $('#snippets'),
				wrapper = document.createElement('ul'),
				snippets = JSON.parse(localStorage.getItem(lang));
			
			showLegend = showLegend || false;
			if (showLegend) {
				var legend = document.createElement('li'),
					span = document.createElement('span');
				legend.setAttribute("class", "legend");
				span.setAttribute("class", "legend_span");
				span.innerHTML = lang;
				legend.appendChild(span);
				wrapper.appendChild(legend);
			}
			
			// create area for each snippet
			for (var i = 0, len = snippets.length; i < len; i++) {
				wrapper.appendChild(render_snippet(snippets[i], lang));
			}
			snippets_div.appendChild(wrapper);
		}
	};
	function toggle_snippets_popup (header_text) {
		if (header_text === "" || header_text === undefined) {
			throw "toggle_snippets_popup: header_text null or undefined!"
		}
		
		$('#h1header').innerHTML = header_text;
		switch (window.getComputedStyle($('#popup'), null).getPropertyValue('display')) {
			case "none":
				$('#content').style.display = 'none';
				$('#footer').style.display = 'none';
				$('#close_icon').style.display = 'inline';
				if (get_page_name() === 'add_item.html') {
					$('#back_icon').style.display = 'none';
					$('#add_icon').style.display = 'inline';
					$('#h2header').style.display = 'none';
				}
				$('#popup').style.display = 'block';
				break;
			case "block":
				$('#content').style.display = 'block';
				$('#footer').style.display = 'block';
				$('#popup').style.display = 'none';
				$('#close_icon').style.display = 'none';
				$('#snippets').innerHTML = '';
				if (get_page_name() === 'add_item.html') {
					$('#add_icon').style.display = 'none';
					$('#back_icon').style.display = 'inline';
					$('#h2header').style.display = 'block';
				}
				break;
			default:
				throw "toggle_snippets_popup: popup.style.display === " + $('popup').style.display;
		}
	};
	function show_saved (snippet, language) {
		var snippets_div = $('snippets'),
			wrapper = document.createElement('ul');
		
		if (snippet === null || snippet === undefined) {
			throw "show_saved: Snippet is null or undefined!";
		}
		
		wrapper.appendChild(render_snippet(snippet, language));
		snippets_div.appendChild(wrapper);
		$('span_' + snippet.details.id).className = 'item_opened';
		$('hidden_' + snippet.details.id).style.display = 'block'; // we want this shown
		toggle_snippets_popup('Snippet Saved');
		// window.scrollTo(0, window.pageYOffset);
	};
	function add_errors (messages) {
		var notifications = $('.notifications');
		if (notifications.getElementsByTagName('li').length !== 0) {
		if ($('li', notifications).length !== 0) {
			notifications.innerHTML = '';
		}
		if (messages === undefined || messages === null || messages.length === 0) {
			var li = document.createElement('li');
			li.className = 'notification';
			li.innerHTML = '= information is required.';
			notifications.appendChild(li);
		} else {
			for (var i = 0, len = messages.length; i < len; i++) {
				var li = document.createElement('li');
				li.className = 'error';
				li.innerHTML = messages[i];
				notifications.appendChild(li);
			}
		}
		
	};
	function validate_form () {
		var elements = $('snippet_form').elements, errors = [];
		for (var i = 0, len = elements.length; i < len; i++) {
			var element = elements[i];
			console.log(element);
			if (element.getAttribute('data-validation') !== null) {
				switch (element.type) {
					case "select-one": // single value select
						if (snippet_langs.indexOf(element.value) === -1) {
							errors.push("You must select a language for your snippet!");
						}
						break;
					case "text":
						var txt = element.value;
						if (element.value === '') {
							errors.push("Please name your snippet.");
						} else if (RegExp.escape(txt) !== element.value) {
							errors.push("Your snippet's name may contain letters, numbers, spaces, hyphens, and underscores.");
						}
						break;
					case "date":
						if (element.value === '' || element.value.match(/\d{4}-\d{1,2}-d{1,2}/)) {
							errors.push('You must select a valid date!');
						}						
						break;
					case "textarea":
						if (element.value === '') {
							errors.push("Your snippet contains no code. Please see to that.");
						}
						break;
					default:
						break;
				}
			}
		}
		if (errors.length !== 0) {
			add_errors(errors);
			return false;
		}
		return true;
	};
	function save_data () {
		var language = $('language').value,
			snippets = [], snippet = {};
				
		if (language in localStorage) {
			snippets = JSON.parse(localStorage.getItem(language));
		}
		snippet = {
			"details": {
				"id": new Date().getTime().toString(),
				"name": $('name').value,
				"added_on": $('added_on').value,
				"relevance": $('relevance').value,
				"favorite": (($('favorite').checked) ? "Yes" : "No")
			},
			"codebase": $('codebase').value
		};
		snippets.push(snippet);
		localStorage.setItem(language.toString(), JSON.stringify(snippets));
		
		show_saved(snippet, language);
	};
	
	// *** START ripped from SDI Project 4 ***
	// privately duck punch RegExp until it sounds like it contains a function to escape special characters
	RegExp.escape = function(str) {
		// return str.replace(/[[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		// removed whitespace from escape
		return str.replace(/[[\]{}()*+?.,\\^$|#]/g, "\\$&");
	};
	function title_case (string) {
		// regexes to the rescue again. amazing how robust those little buggers are, isn't it?
		return string.replace(/\w\S*/g, function(text) { return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase(); });
	};
	function inline_replace (string, char1, char2) {
		var pattern = new RegExp(RegExp.escape(char1), "g");
		return string.replace(pattern, char2);
	};
	function s2n (string) {
		return (string.indexOf('.') !== -1) ? parseFloat(string) : parseInt(string);
	};
	// *** END ripped from SDI Project 4 ***
		
	// event handlers
	function showAll () {
		if (load_counts().length === 0) {
			var snippets_div = $('#snippets'),
				list = document.createElement('ul');
			render_help_message(list);
			snippets_div.appendChild(list);
		} else {
			for (var i = 0, len = snippet_langs.length; i < len; i++) {
				render_snippets_by_language(snippet_langs[i], true);
			}
		}
		
		toggle_snippets_popup('All Snippets');
	};
	function clearAll () {
		if (confirm("Are you sure?\n\nYou will not be able to recover the data you are about to erase.")) {
			window.localStorage.clear(); // don't really care if it's empty or not.
			window.location.reload();
		}
	};
	function navigate () {
		(this.id === "add_icon") ? window.location.assign("add_item.html") : window.location.assign("index.html");
	};
	function closePopup () {
		toggle_snippets_popup('My Snippets');
		window.location.assign('index.html');
	};
	function submitForm (event) {
		event.preventDefault();
		if (validate_form()) {
			save_data();
		}
		// event.preventDefault();
	};
	function expandSnippet () {
		var hidden = $('hidden_' + this.id);
		var span = $('span_' + this.id);
		(hidden.style.display === "none") ? hidden.style.display = "block" : hidden.style.display = "none";
		(span.className === 'item_closed') ? span.className = 'item_opened' : span.className = 'item_closed';
	};
	function clickListItem () {
		render_snippets_by_language(this.id);
		toggle_snippets_popup(this.id);
	};
	function editSnippet (event) {
		var language = this.getAttribute('data-lang'), snippet,
			snippets = JSON.parse(localStorage.getItem(language));

		event.preventDefault();
		
		for (var i = 0, len = snippets.length; i < len; i++) {
			if (snippets[i].details.id === this.getAttribute('data-id')) {
				snippet = snippets[i];
			}
		}
		var href = ['add_item.html?language=', language, '&name=', snippet.details.name, '&added_on=', snippet.details.added_on,
			'&relevance=', snippet.details.relevance, '&favorite=', ((snippet.details.favorite === 'Yes') ? 'on' : ''), 
			'&codebase=', snippet.codebase];
		location.replace(href.join(''));
		// $('language').value = language;
		// 		$('name').value = snippet.details.name;
		// 		$('added_on').value = snippet.details.added_on;
		// 		$('relevance').value = snippet.details.relevance;
		// 		$('favorite').checked = ((snippet.details.favorite === 'Yes') ? 'checked' : '');
	};
	function deleteSnippet (event) {};
		
	//public
	ns.initialize = function () {
		// add event listeners
		$('#close_icon').addEventListener('click', closePopup);
		$('#add_icon').addEventListener('click', navigate);
		$('#show_all').addEventListener('click', showAll);
		$('#clear_all').addEventListener('click', clearAll);
		
		// fixup the top location of content and snippet_popup areas.
		// $('content').style.top = $('h1header').offsetHeight + 'px';
		// $('popup').style.top = $('h1header').offsetHeight + 'px';
		
		// handle per-page setup
		if (get_page_name() === 'index.html') {
			populate_language_list();
		} else {
			// add event listeners
			$('#back_icon').addEventListener('click', navigate);
			// $('submit').addEventListener('click', saveData);
			$('#snippet_form').addEventListener('submit', submitForm);
			
			populate_select();
			
			// fixup padding of content area
			// $('#content').style.paddingTop = $('h2header').offsetHeight + 'px';
			
			// hide add_icon until needed
			$('#add_icon').style.display = "none";
			
			// inform user about required fields
			add_errors();
			
			// set max date to today
			var temp = new Date(), tmonth = '0' + (temp.getMonth() + 1).toString(),
				datestring = temp.getFullYear() + '-' + tmonth + '-' + temp.getDate();
			$('#added_on').setAttribute("max", datestring);
			
			// hide/show the sub-header and footer when the snippet textarea is being edited for visibility
			$('#codebase').addEventListener('focus', function() { 
				$('h2header').style.display = "none";
				$('footer').style.display = "none";
			});
			$('#codebase').addEventListener('blur', function() {
				$('h2header').style.display = "block";
				$('footer').style.bottom = 0;
				$('footer').style.display = "block";
			});
		}
	};
}(window.vfw = window.vfw || {}, window.$);

try {
	document.addEventListener("DOMContentLoaded", vfw.initialize, false);
} catch (e) {
	console.log(e.message, 'in file', e.fileName, 'on line', e.lineNumber);
}
