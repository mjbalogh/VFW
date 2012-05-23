/*
	Filename: include.js
	Author: Michael Balogh
	Note: exports include function. This function allows a js file to require another js/css file. this file wil be loaded
		into the DOM as the first script file of the body, or if the body is not available, as the last child of the head
*/
!function (window) {
	var queue = [], done = {}, isDomReady = false, document = window.document;
	
	document.head = document.head || document.getElementsByTagName('head')[0];
	
	function isFn(fn) { return Object.prototype.toString.call(fn) === '[object Function]'; }
	function insertFile(filename) {
		/\.(\w+)$/.test(filename);
		var extension = RegExp.$1;
		switch (extension) {
			case 'js':
			case 'json':
				var script = document.createElement('script');
				if (extension === 'js') {
					script.type = 'text/javascript';
					script.async = true;
				} else {
					script.type = 'application/json';
					script.async = false;
				}
				script.src = filename;
				(document.body) ? document.body.insertBefore(script, document.body.getElementsByTagName('script')[0]) :
					document.head.appendChild(script);
				break;
			case 'css':
				var link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = filename;
				head.appendChild(link);
		}
	}
	function loadFiles(args) {
		for (var i = 0, len = args.length; i < len; i++) {
			var files = args[i].files,
				callback = args[i].callback;
			for (var n = 0, nlen = files.length; n < nlen; n++) {
				if (done[files[n]] === undefined) {
					insertFile(files[n]);
					done[files[n]] = true;
				}
			}
			callback();
		}
	}
	function start() {
		if (!isDomReady) {
			isDomReady = true;
			loadFiles(queue);
		}
	}
	
	window.require = function(array, callback) {
		var args;
		if (typeof array !== 'array' || array.length === 0) array = [array];
		callback = callback || (function(){});
		args = {'files': array, 'callback': callback};
		
		if (!isDomReady) {
			queue.push(args);
		} else if (queue.length > 0) {
			queue.push(args);
		} else {
			loadFiles([args]);
		}
	};
	
	document.addEventListener('DOMContentLoaded', start);
	// just in case, this always gets called...
	window.addEventListener('load', 'start')
}(window);
