(function(ns, $, undefined) {
	// private
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
	var getPageName = function () {
		var path = window.location.pathname;
		return path.substr(path.lastIndexOf('/') + 1);
	};
	var showAll = function () {
		for (var i = 0, len = ns.langs.length; i < len; i++) {
			var lang = ns.langs[i];
			ns.renderSnippetsByLang(lang, true);
		}
		$('snippets_header').innerHTML = "All Snippets"
		$('snippets').style.top = $('h1header').offsetHeight + 'px';
		$('snippets_popup').style.display = "block";
	};
	var clearAll = function () {
		window.localStorage.clear();
		window.location.reload();
	};
	var navigate = function () {
		var page = getPageName();
		(page === 'index.html') ? window.location.assign("add_item.html") : window.location.assign("index.html");
	};
	var closePopup = function() {
		$('snippets_popup').style.display = "none";
		$('snippets_header').innerHTML = '';
		$('snippets').innerHTML = '';
	};
	ns.renderSnippetsByLang = function (lang, showLegend) {
		// var snippets_div = $('snippets'),
		// 			ul = document.createElement('ul'),
		// 			snippets, legend;

		if (lang in localStorage) {
			var snippets_div = $('snippets'),
				wrapper = document.createElement('ul'),
				snippets = JSON.parse(localStorage.getItem(lang));

			// wrapper.setAttribute("class", "wrapper");
			
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
				li.addEventListener('click', ns.expandSnippet);
				name.id = "name_" + snippet.details.id;
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
				// darea.appendChild(lpanel);
				details.appendChild(lpanel);
				// darea.appendChild(rpanel);
				details.appendChild(rpanel);
				// hidden.appendChild(darea);
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

		// showLegend = showLegend || false;
		// if (showLegend) {
		// 			legend = document.createElement('li');
		// 			legend.setAttribute("class", "legend");
		// 			legend.innerHTML = '<span>' + lang + '</span>';
		// 			ul.appendChild(legend);
		// 		}
		// 		for (var i = 0, len = snippets.length; i < len; i++) {
		// 			var snippet = snippets[i],
		// 				li = document.createElement('li'),
		// 				lihtml = '<span class="full" id="sp_' + snippet.details.id + '">' + snippet.details.name + '</span>' +
		// 					'<ul class="hidden" id="ul_' + snippet.details.id + '"><li class="legend"><span>Details</span></li>' +
		// 					'<li><span class="left">Name</span><span class="right">' + snippet.details.name + '</span></li>'+
		// 					'<li><span class="left">Added on</span><span class="right">' + snippet.details.added_on + '</span></li>' +
		// 					'<li><span class="left">Relevance</span><span class="right">' + snippet.details.relevance + '</span></li>' +
		// 					'<li><span class="left">Favorite</span><span class="right">' + ((snippet.details.favorite === 'on') ? "Yes" : "No") + '</span></li>' +
		// 					'<li class="legend"><span>Snippet Code</span></li><li><span>' + snippet.snippet + '</span></li></ul>';
		// 			li.id = snippet.details.id;
		// 			li.innerHTML = lihtml;
		// 			li.addEventListener('click', ns.expandSnippet);
		// 			ul.appendChild(li);
		// 		}
		// snippets_div.appendChild(ul);
	};
	ns.expandSnippet = function() {
		var name = $('name_' + this.id),
			hidden = $('hidden_' + this.id);
		if (hidden.style.display === "none") {
			name.style.marginBottom = '5px';
			hidden.style.display = "block"
		} else {
			name.style.marginBottom = 0;
			hidden.style.display = "none";
		}
	};
	ns.langs = ['Bash', 'CSS', 'HTML', 'JavaScript', 'Perl', 'PHP', 'Python', 'Ruby'];
	ns.initialize = function () {
		// add event listeners
		$('show_all').addEventListener('click', showAll);
		$('icon').addEventListener('click', navigate);
		$('clear_all').addEventListener('click', clearAll);
		$('close').addEventListener('click', closePopup);
		
		// fixup the positioning of content area.
		$('content').style.top = $('h1header').offsetHeight + 'px';
		if ($('h2header') !== null) {
			$('content').style.paddingTop = $('h2header').offsetHeight + 'px';
		}
	};
} (window.vfw = window.vfw || {}, function(element) { return document.getElementById(element); }));
try {
	document.addEventListener("DOMContentLoaded", vfw.initialize, false);
} catch (e) {
	console.log(e.message, 'in file', e.fileName, 'on line', e.lineNumber);
}