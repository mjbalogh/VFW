(function(ns, $, undefined) {
	// private
	var getPageName = function () {
		var path = window.location.pathname;
		return path.substr(path.lastIndexOf('/') + 1);
	};
	var showAll = function () {
		alert('Show all clicked!');
	};
	var clearAll = function () {
		window.localStorage.clear();
		window.location.reload();
	};
	var navigate = function () {
		var page = getPageName();
		(page === 'index.html') ? window.location.assign("add_item.html") : window.location.assign("index.html");
	};
	
	ns.langs = ['Bash', 'CSS', 'HTML', 'JavaScript', 'Perl', 'PHP', 'Python', 'Ruby'];
	ns.initialize = function () {
		$('show_all').addEventListener('click', showAll);
		$('icon').addEventListener('click', navigate);
		$('clear_all').addEventListener('click', clearAll);
		
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