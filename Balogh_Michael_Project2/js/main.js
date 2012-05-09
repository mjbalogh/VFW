(function(ns, $, undefined) {
	// private
	var getPageName = function () {
		var path = window.location.pathname;
		return path.substr(path.lastIndexOf('/') + 1);
	};
	var showAll = function () {
		alert('Show all clicked!');
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
		var snippets_div = $('snippets'),
			ul = document.createElement('ul'),
			snippets, legend;
			
		if (lang in localStorage) {
			snippets = JSON.parse(localStorage.getItem(lang));
		} else { return; }
			
		showLegend = showLegend || false;
		if (showLegend) {
			legend = document.createElement('li');
			legend.setAttribute("class", "legend");
			legend.innerHTML = '<span>' + lang + '</span>';
			ul.appendChild(legend);
		}
		for (var i = 0, len = snippets.length; i < len; i++) {
			var snippet = snippets[i],
				li = document.createElement('li'),
				lihtml = '<span class="full" id="sp_' + snippet.details.id + '">' + snippet.details.name + '</span>' +
					'<ul class="hidden" id="ul_' + snippet.details.id + '"><li class="legend"><span>Details</span></li>' +
					'<li><span class="left">Name</span><span class="right">' + snippet.details.name + '</span></li>'+
					'<li><span class="left">Added on</span><span class="right">' + snippet.details.added_on + '</span></li>' +
					'<li><span class="left">Relevance</span><span class="right">' + snippet.details.relevance + '</span></li>' +
					'<li><span class="left">Favorite</span><span class="right">' + ((snippet.details.favorite === 'on') ? "Yes" : "No") + '</span></li>' +
					'<li class="legend"><span>Snippet Code</span></li><li><span>' + snippet.snippet + '</span></li></ul>';
			li.id = snippet.details.id;
			li.innerHTML = lihtml;
			li.addEventListener('click', ns.expandSnippet);
			ul.appendChild(li);
		}
		snippets_div.appendChild(ul);
	};
	ns.expandSnippet = function() {
		var ul = $('ul_' + this.id),
			sp = $('sp_' + this.id);
		if (ul.style.display === "none") {
			sp.style.marginBottom = '10px';
			ul.style.display = "block"
		} else {
			sp.style.marginBottom = 0;
			ul.style.display = "none";
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