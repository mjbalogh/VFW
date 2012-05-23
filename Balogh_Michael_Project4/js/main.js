/*
	Project: 3
	Class: Visual Frameworks
	Term: 1205
	Author: Michael Balogh
	*/
// normally I would just use jQuery instead of reinventing the wheel, but...
!function (window) {
	"use strict";

	var document = window.document, isId = /^\#([-\w]+)$/, isClass = /^\.([-\w]+)/g,
		allClasses = /^\.([-\w]+)/g, isTag = /^[-\w]+$/;

	// return single #id, or array containing .class or tag elements. use querySelectorAll if all else fails
	window.$ = function (selector, element) {
		element = element || document;

		if (element === document && isId.test(selector)) {
			return element.getElementById(RegExp.$1);
		} else if (element.nodeType === 1 || element.nodeType === 9) {
			if (isClass.test(selector)) {
				return element.getElementsByClassName(selector.match(allClasses).join(' '));
			} else if (isTag.test(selector)) {
				return element.getElementsByTagName(RegExp.$1);
			} else {
				return element.querySelectorAll(selector);
			}
		}
	};
}(window);

!function (ns, undefined) {
	var slice = Array.prototype.slice;
	window.debug = window.debug || true;
	
	function sprintf (string) {
		var pattern = new RegExp('%([1-' + arguments.length + '])', 'g');
		return String(string).replace(pattern, function(match, index) { return arguments[i]; });
	}
	function logf () {
		switch (arguments[0]) {
			case 'warn':
				if (window.debug && !!console) {
					console.warn(sprintf(slice.call(arguments, 1).join(',')));
				}
				break;
			case 'error':
				if (window.debug && !!console) {
					console.error(sprintf(slice.call(arguments, 1).join(',')));
				}
				break;
			default:
				console.log(sprintf(slice.call(arguments).join(',')));
		}
	}
	
	ns.log = function (string) { logf(string); };
	ns.warn = function (string) { logf('warn', string); };
	ns.error = function (string) { logf('error', string); };

	if (!!window.debug) require('js/json.js');	
}(window.util = window.util || {});

!function (ns, $, undefined) {
	"use strict";

	// private variables
	var supported_langs = ['Bash', 'CSS', 'HTML', 'JavaScript', 'Perl', 'PHP', 'Python', 'Ruby'];
	
	// private functions
	function get_snippet (language, item_id) {
		language = language || undefined;
		if (language !== undefined) {
			if (language in localStorage) {
				var snippets = this.getByCategory(language);
				if (item_id in snippets) {
					return snippets[item_id];
				}
				return null;
			}
			return null;
		} else {
			for (var i = 0, len = supported_langs.length; i < len; i++) {
				var lang = supported_langs[i];
				if (lang in localStorage) {
					var snippets = this.get_by_language(lang);
					if (item_id in snippets) {
						return snippets[item_id];
					}
				}
			}
			return null;
		};
	}
	function get_by_language (language) {
		if (language in localStorage) {
			return JSON.parse(localStorage.getItem(language));
		}
		return null;
	}
	function add_errors (messages) {
		var notifications = $('#notifications');
		if (notifications.hasChildNodes()) {
			notifications.innerHTML = '';
		}
		if (messages === undefined || messages === null || messages.length === 0) {
			var li = document.createElement('li');
			li.className = 'notification greyed li-div';
			li.innerHTML = '= information is required.';
			notifications.appendChild(li);
		} else {
			for (var i = 0, len = messages.length; i < len; i++) {
				var li = document.createElement('li');
				li.className = 'error li-div';
				li.innerHTML = messages[i];
				notifications.appendChild(li);
			}
		}
	}
	function load_counts () {
		var array = [];
		for (var i = 0, len = supported_langs.length; i < len; i++) {
			var lang = supported_langs[i];
			if (lang in localStorage) {
				var snippets = get_by_language(lang),
					count = Object.keys(snippets).length;
				if (count !== undefined && count > 0) {
					array.push({"name": lang, "count": count});
				}
			}
		}
		return array;
	}
	function populate_language_list () {
		var langs = load_counts(),
		list = $('#language_list'),
		frag = document.createDocumentFragment();
		if (langs.length === 0) {
			render_help_message(list);
		} else {
			for (var i = 0, len = langs.length; i < len; i++) {
				var lang = langs[i],
				item = document.createElement('li');
				
		        item.id = lang.name;
		        item.className = 'lang-item li-div';
		        item.setAttribute("data-count", lang.count.toString());
		        item.innerHTML = lang.name;
		        item.addEventListener('click', clickListItem);
		        frag.appendChild(item);
	    	}
		}
		list.appendChild(frag);
	}
	function populate_select () {
	  	var select = $('#language'),
			frag = document.createDocumentFragment();

	  	if ($('#language').options.length > 1) return;

	  	for (var i = 0, len = supported_langs.length; i < len; i++) {
	  		var option = document.createElement('option'),
	  			language = supported_langs[i];

	  		option.value = language;
	  		option.innerHTML = language;
	  		frag.appendChild(option);
	  	}
		select.appendChild(frag);
	}
	function render_help_message (list) {
		var item = document.createElement('li');
		if (list.nodeName !== 'UL' && list.nodeName !== 'OL') {
			throw "render_help_message: element is not a list!";
		}
		item.className = 'greyed li-div';
		item.innerHTML = "Click the '<strong>&#10010;</strong>' to add your first snippet.";
		list.appendChild(item);
	}
	function render_snippet (snippet, language, id) {
		var li = document.createElement('li'),
			frag = document.createDocumentFragment(),
		  	name = document.createElement('div'),
			nicon = document.createElement('div'),	// remove later, tacky
		  	nspan = document.createElement('span'),
		  	hidden = document.createElement('div'),
		  	details = document.createElement('div'),
		  	dspan = document.createElement('span'),
		  	darea = document.createElement('div'),
		  	rpanel = document.createElement('div'),
		  	lpanel = document.createElement('div'),
		  	snip = document.createElement('div'),
		  	sspan = document.createElement('span'),
		  	stext = document.createElement('textarea'),
		  	barea = document.createElement('div'),
		  	bedit = document.createElement('button'),
		  	bdelete = document.createElement('button');

		if (snippet === null || snippet === undefined) {
			throw "render_snippet: snippet argument is null or undefined";
		}
		
		language = language || undefined;
		
		name.id = id;
		name.className = 'snippet-name'
		name.addEventListener('click', expandSnippet);
		nicon.className = language;
		nspan.id = 'span_' + id;
		nspan.className = 'item-closed';
		nspan.textContent = snippet.name;
		name.appendChild(nicon);
		name.appendChild(nspan);
		frag.appendChild(name);

		// setup hidden div
		hidden.id = 'hidden_' + id;
		hidden.style.display = 'none';
		hidden.className = 'hidden';
		hidden.setAttribute('data-name', snippet.name);
		if (language !== undefined) {
			hidden.setAttribute('data-language', language);
		}

		// details section
		details.className = 'legend';
		dspan.className = 'snippet_details';
		dspan.textContent = 'Details';
		details.appendChild(dspan);

		// setup right and left divs
		lpanel.className = 'panel heading left';
		rpanel.className = 'panel right';

		for (var key in snippet) {
			if (snippet.hasOwnProperty(key)) {
				var div1 = document.createElement('div'),
					div2 = document.createElement('div');
	
				if (key === 'name' || key == 'codebase') continue;

				// setup the right span
				div1.textContent = snippet[key];
				rpanel.appendChild(div1);

				// setup the left span
				// replace '_' with a space, title case the string, and terminate it with a ':'
				div2.textContent = title_case(inline_replace(key, "_", " ")) + ':';
				lpanel.appendChild(div2);
			}
		}
		details.appendChild(lpanel);
		details.appendChild(rpanel);
		hidden.appendChild(details);

		snip.className = 'legend';
		sspan.className = 'snippet_details ';
		sspan.textContent = 'Snippet Code';
		snip.appendChild(sspan);
		hidden.appendChild(snip);

		stext.className = 'code';
		stext.rows = '8';
		stext.readOnly = 'readonly';
		stext.textContent = snippet.codebase;
		hidden.appendChild(stext);
		
		barea.className = 'actions';
		
		bedit.type = 'button';
		bedit.setAttribute('data-language', language);
		bedit.setAttribute('data-id', id);
		bedit.addEventListener('click', editSnippet);
		bedit.textContent = 'Edit';
		barea.appendChild(bedit);
		
		bdelete.type = 'button';
		bdelete.className = 'right';
		bdelete.setAttribute('data-language', language);
		bdelete.setAttribute('data-id', id);
		bdelete.addEventListener('click', deleteSnippet);
		bdelete.textContent = 'Delete';
		barea.appendChild(bdelete);
		hidden.appendChild(barea);
		
		frag.appendChild(hidden);
		li.appendChild(frag);
		
		return li;
	}
	function render_snippets_by_language (lang, showLegend) {
		if (lang in localStorage) {
			var snippets_div = $('#snippets'),
			list = document.createElement('ul'),
			snippets = get_by_language(lang);
			showLegend = showLegend || false;
	
			if (showLegend) {
				var legend = document.createElement('li'),
				span = document.createElement('span');
				legend.className = 'legend';
				span.className = 'legend_span';
				span.innerHTML = lang;
				legend.appendChild(span);
				list.appendChild(legend);
			}
			
			// create area for each snippet
			for (var id in snippets) {
				var snippet = snippets[id];
				list.appendChild(render_snippet(snippet, lang, id));
			}
			snippets_div.appendChild(list);
		}
	}
	function show_home (activate) {
		if (activate) {
			// hide other sections
			show_additem (!activate);
			show_popup(!activate);

			$('#page-header').innerHTML = 'My Snippets';
			$('#add-icon').style.display = 'block';
			$('#back-icon').style.display = 'none';
			$('#close-icon').style.display = 'none';
			populate_language_list();
			$('#home').style.display = 'block';
		} else {
			$('#home').style.display = 'none';
			$('#language_list').innerHTML = '';
		}
	}
	function show_additem (activate, header_text) {
		header_text = header_text || 'Add Snippet';
		if (activate) {
			// hide other sections
			show_home(!activate);
			show_popup(!activate);

			$('#page-header').innerHTML = header_text;
			$('#add-icon').style.display = 'none';
			$('#back-icon').style.display = 'block';
			$('#close-icon').style.display = 'none';
			add_errors();
			populate_select();
			$('#add-item').style.display = 'block';
		} else {
			$('#add-item').style.display = 'none';
			$('#language').value = '--Select Language--';
			$('#name').value = '';
			$('#added_on').value = '';
			$('#relevance').value = '0';
			$('#favorite').checked = '';
			$('#codebase').value = '';
		}
	}
	function show_popup(activate, header_text) {
		if (activate) {
			// hide other sections
			show_home(!activate);
			show_additem(!activate);

			header_text = header_text || 'All Snippets';
			$('#page-header').innerHTML = header_text;
			$('#add-icon').style.display = 'block';
			$('#back-icon').style.display = 'none';
			$('#close-icon').style.display = 'block';
			$('#content').style.background = 'rgba(0, 0, 0, .9)';
			$('#popup').style.display = 'block';
		} else {
			$('#popup').style.display = 'none';
			$('#snippets').innerHTML = '';
		}
	}
	function show_saved (snippet, language, id) {
		var snippets_div = $('#snippets'),
		list = document.createElement('ul');
		
		if (snippet === null || snippet === undefined) {
			throw "show_saved: Snippet is null or undefined!";
		}
		
		list.appendChild(render_snippet(snippet, language, id));
		snippets_div.appendChild(list);
		$('#span_' + id).className = 'item_opened';
		$('#hidden_' + id).style.display = 'block'; // we want this shown
		show_popup(true, 'Snippet Saved');
	}
	function validate_form () {
		var elements = $('#snippet_form').elements, errors = [];
		for (var i = 0, len = elements.length; i < len; i++) {
			var element = elements[i];
			if (element.getAttribute('data-validation') !== null) {
				switch (element.type) {
					case "select-one": // single value select
						if (supported_langs.indexOf(element.value) === -1) {
							errors.push("You must select a language for your snippet!");
						}
						break;
					case "text":
						var txt = element.value, regex = /^[-\s\w&]+$/g;
						if (element.value === '') {
							errors.push("Please name your snippet.");
						} else if (!(regex.test(element.value))) {
							errors.push("Your snippet's name may contain letters, numbers, spaces, hyphens, and apmersands.");
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
	}
	function save_data () {
		var language = $('#language').value, snippets = {}, snippet,
			id = $('#id').value || new Date().getTime().toString();
		if (language === undefined || language === null) {
			throw "saveData: language is null or undefined";
		}
				
		if (language in localStorage) {
			snippets = get_by_language(language);
		}
		snippet = {
			"name": $('#name').value,
			"added_on": $('#added_on').value,
			"relevance": $('#relevance').value,
			"favorite": ($('#favorite').checked ? 'Yes' : 'No'),
			"codebase": $('#codebase').value
		};
		snippets[id] = snippet;
		localStorage.setItem(language.toString(), JSON.stringify(snippets));

		 show_saved(snippet, language, id);
	}

	// *** START ripped from SDI Project 4 ***
	// privately duck punch RegExp until it sounds like it contains a function to escape special characters
	RegExp.escape = function(str) {
		return str.replace(/[[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	function title_case (string) {
		// regexes to the rescue again. amazing how robust those little buggers are, isn't it?
		return string.replace(/\w\S*/g, function(text) { return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase(); });
	}
	function inline_replace (string, char1, char2) {
		var pattern = new RegExp(RegExp.escape(char1), "g");
		return string.replace(pattern, char2);
	}
	// *** END ripped from SDI Project 4 ***

	// event handlers
	function showAll () {
		if (!!window.debug) {
			if (confirm("Do you want to load the test fixtures?")) {
				loadFixtures();
			}
		}
		$('#show-all').style.visibility = 'hidden';
		$('#snippets').innerHTML = '';
		if (load_counts().length === 0) {
			var snippets_div = $('#snippets'),
			list = document.createElement('ul');
			render_help_message(list);
			snippets_div.appendChild(list);
		} else {
			for (var i = 0, len = supported_langs.length; i < len; i++) {
				render_snippets_by_language(supported_langs[i], true);
			}
		}
		
		show_popup(true, 'All Snippets');
	}
	function clearAll () {
		if (confirm("Are you sure?\n\nYou will not be able to recover the data you are about to erase.")) {
			window.localStorage.clear(); // don't really care if it's empty or not.
			window.location.reload();
		}
	}
	function navigate () {
		$('#content').style.backgroundColor = 'transparent';
		$('#show-all').style.visibility = 'visible';

		switch (this.id) {
			case 'add-icon':
				show_additem(true);
				break;
			case 'back-icon':
			case 'close-icon':
				show_home(true);
				break;
			default:
				throw 'Navigation for ' + this.id + 'is not available.';
		}
	}
	function submitForm (event) {
		event.preventDefault();
		if (validate_form()) {
			save_data();
		}
	}
	function expandSnippet () {
		var hidden = $('#hidden_' + this.id),
			span = $('#span_' + this.id);
		(hidden.style.display === 'none') ? hidden.style.display = 'block' : hidden.style.display = 'none';
		(span.className === 'item-closed') ? span.className = 'item-opened' : span.className = 'item-closed';
	}
	function clickListItem () {
		render_snippets_by_language(this.id);
		show_popup(true, this.id);
	}
	function editSnippet (event) {
		var language = this.getAttribute('data-language');

		if (language in localStorage) {
			var snippets = get_by_language(language),
				id =this.getAttribute('data-id');
			if (id in snippets) {
				var snippet = snippets[id];

				show_additem(true, 'Edit Snippet');

				$('#language').value = language;
				$('#name').value = snippet.name;
				$('#added_on').value = snippet.added_on;
				$('#relevance').value = snippet.relevance;
				$('#favorite').checked = ((snippet.favorite=== 'Yes') ? 'checked' : '');
				$('#codebase').value = snippet.codebase;
				$('#id').value = id;
			}
		}
	}
	function deleteSnippet (event) {
		event.preventDefault();
		if (confirm("Are you sure you want to delete this snippet?")) {
			var language = this.getAttribute('data-language'),
				id = this.getAttribute('data-id');

			if (language in localStorage) {
				var snippets = get_by_language(language);
				if (id in snippets) delete snippets[id];
				console.log(snippets[id]);
				if (Object.keys(snippets).length === 0){
					localStorage.removeItem(language);
				} else {
					localStorage.setItem(language, JSON.stringify(snippets));
				}
				window.location.reload();
			}
		}
	}

	//public
	ns.initialize = function () {
		// add event listeners
		$('#add-icon').addEventListener('click', navigate);
		$('#back-icon').addEventListener('click', navigate);
		$('#close-icon').addEventListener('click', navigate);
		$('#show-all').addEventListener('click', showAll);
		$('#clear-all').addEventListener('click', clearAll);
		$('#snippet_form').addEventListener('submit', submitForm);

		// hide/show the sub-header and footer when the snippet textarea is being edited for visibility
		$('#codebase').addEventListener('focus', function() {
			$('#footer').style.display = "none";
			$('#content').style.bottom = "0";
		});
		$('#codebase').addEventListener('blur', function() {
			$('#content').style.bottom = '24px';
			$('#footer').style.bottom = 0;
			$('#footer').style.display = "block";
		});
		
		// // set max date to today
		var temp = new Date(), tmonth = '0' + (temp.getMonth() + 1).toString(),
			datestring = temp.getFullYear() + '-' + tmonth + '-' + temp.getDate();
		$('#added_on').setAttribute("max", datestring);

		// lets get this show started
		show_home(true);
	};
}(window.vfw = window.vfw || {}, window.$);

try {
	document.addEventListener("DOMContentLoaded", vfw.initialize, false);
} catch (e) {
	console.log(e.message, 'in file', e.fileName, 'on line', e.lineNumber);
}
