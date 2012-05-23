/*
	Project: 3
	Class: Visual Frameworks
	Term: 1205
	Author: Michael Balogh
*/

// normally I would just use jQuery instead of reinventing the wheel, but...
!function(window, $, undefined) {
	var document = window.document,
		isId = /^\#([\w-]+)$/,
		isClass = /^\.([\w-]+)$/g,
		isTag = /^[\w-]+$/;
	
	// give precedence to jQuery
	var $ = function (selector) {
		var elements, selectors = [];
		function get(selector) {
			var got;
			return (document && isId.test(selector)) ?
				((got = document.getElementById(RegExp.$1)) ? [got] : new Array()) :
				Array.prototype.slice.call(isClass.test(selector) ? document.getElementsByClassName(selector.replace(/\./g, '')) :
				isTag.test(selector) ? document.getElementsByTagName(selector) :
				document.querySelectorAll(selector));
		}
		if (typeof selector !== 'array') {
			return get(selector)[0];
		} else {
			var results = [];
			for (var i = 0, len = selector.length; i < len; i++) {
				Array.prototype.push.apply(results, get(selector[i]));
			}
			return results;
		}
	}
	
	window.$ = window.$ || $;
} (window);

!function(ns, undefined) {
	// base classes
	var Notifier = !function() {
		 var observers = [];
		 var addObserver = function (observer) {
			 observers.push(observer);
		 };
		 var removeObserver = function (observer) {
			 if (observers.length === 0) return;
			 observers = observers.filter(function(item) {
				 if (item !== observer) return item;
			 });
		 };
		 var notify = function (notification) {
			 if (observers.length === 0) return;
			 for (var i = 0, len = observers.length; i < len; i++) {
				 observers[i].receive(notification);
			 }
		 }
		
	} ();
	
	// Add extension abilities to Object
	Object.extend = function(target, sources) {
		Array.prototype.slice.call(sources, 1).forEach(function(source) {
			for (var property in source) {
				if (source[property] !== undefined) {
					target[property] = source[property];
				}
			}
		});
		return target;
	};
	Object.prototype.extend = function(sources) {
		return Object.extend.apply(this, [this, sources])
	};
	Object.inheritMethods = function(target, source) {
		Array.prototype.slice.call(arguments, 2).forEach(function(property) {
			if (property !== undefined) {
				target.prototype[property] = source[property];
			}
		});
	};
	Object.prototype.inheritMethods = function(source) {
		return Object.inheritMethods.apply(this, [this, source]);
	}
	
	// notification object to send to observers
	ns.Notification = function(name, data) {
		this.name = name;
		this.data = data;
	};
	
	ns.Model = function() {
		extend(Notifier);
	};
	
	ns.Controller = function() {
		var views = []
	};
	ns.Controller.prototype.addView = function (view) {
		if (!(view in views)) {
			views.push(view)
		}
	}
	ns.View = function() {
		extend(Notifier);
	};
} (window);

!function(ns, $, undefined) {
	// private
	var supported_langs = ['Bash', 'CSS', 'HTML', 'JavaScript', 'Perl', 'PHP', 'Python', 'Ruby'],
		localModel = new Model(),
		controller = new Controller(localModel),
		homeView = new View();
	
	// define localModel methods
	localModel.saveData = function() {
		var language = $('#language').value, snippets = {},
			id = $('#id') || new Date().getTime().toString();
		if (language === undefined || language === null) {
			throw "saveData: language is null or undefined";
		}
				
		if (language in localStorage) {
			snippets = JSON.parse(localStorage(language));
		}
				
		snippets[id] = {
			"name": $('#name').value,
			"added_on": $('#added_on').value,
			"relevance": $('#relevance').value,
			"favorite": ($('#favorite').checked ? 'Yes' : 'No'),
			"codebase": $('codebase').value
		};
		localStorage.setItem(language, JSON.stringify(snippets));
				
		this.notify('recordSaved', true);
	};
	localModel.getCategoryCounts = function() {
		var array = [];
		for (var i = 0, len = supported_langs.length; i < len; i++) {
			var lang = supported_langs[i];
			if (lang in localStorage) {
				var snippets = this.getByCategory(lang),
					count = Object.keys(snippets).length;
				if (count !== undefined && count > 0) {
					array.push({"name": lang, "count": count});
				}
			}
		}
		return array;
	};
	localModel.getAll = function() {
		var array = [];
		for (var i = 0, len = supported_langs.length; i < len; i++) {
			var lang = supported_langs[i];
			if (lang in localStorage) {
				var snippets = this.getByCategory(lang),
					count = snippets.keys.length;
				if (count !== undefined && count > 0) {
					array.push({"name": lang, "snippets": snippets});
				}
			}
		}
		return array;
	};
	localModel.getByCategory = function(category) {
		if (category in localStorage) {
			return JSON.parse(localStorage.getItem(category));
		}
		return null;
	};
	localModel.getItem = function(category, item_id) {
		category = category || undefined;
		if (category !== undefined) {
			if (category in localStorage) {
				var snippets = this.getByCategory(category);
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
					var snippets = this.getByCategory(lang);
					if (item_id in snippets) {
						return snippets[item_id];
					}
				}
			}
			return null;
		};
	};

	// define homeView methods
		// homeView.receive = function (name, data) {
		// 	switch (name) {
		// 	case 'activate':
		// 		(data === 'home') ? this.activate(true) : this.activate(false);
		// 		break;
		// 	};
		// };
		homeView.activate = function (isActive) {
			if (!isActive) {
				$('#content').innerHTML = '';
			} else {
				var content = $('#content'),
					section = document.createElement('section'),
					div = document.createElement('div'),
					ul = document.createElement('ul');
					
				section.id = 'home';
				
				// create tag line	
				div.className = 'tagline';
				div.innerHTML = 'The <strong>best</strong> way to access your snippets!';
				section.appendChild(div);
					
				// setup language list
				ul.id = 'language_list';
				section.appendChild(ul);
				$('#content').appendChild(section)
					
				this.renderLanguageList();
			}
		};
		homeView.renderLanguageList = function() {
			var langs = localModel.getCategoryCounts();
			if (langs.length === 0) {
				this.renderNoSnippets($('#language_list'));
			} else {
				var list = $('#language_list')
				for (var i = 0, len = langs.length; i < len; i++) {
					var lang = langs[i],
						li = document.createElement('li');
					li.id = lang.name;
					li.className = 'lang_item';
					li.setAttribute('data-count', lang.count.toString());
					li.innerHTML = lang.name;
					li.addEventListener('click', this.listItemClicked);
					list.appendChild(li);
				}
			}
		};
		homeView.listItemClicked = function() {
			notify('renderlanguageSnippets', this.id);
		};
		var renderNoSnippets = function (list) {
		if (list.nodeName !== 'UL' && list.nodeName !== 'OL') {
			throw "renderNoSnippets: argument is not a list";
		} else {
			var li = document.createElement('li');
			li.className = 'greyed';
			li.innerHTML = "Click the '<strong>&#10010;</strong>' to add your first snippet.";
			list.appendChild(li);
		}
	};

	ns.initialize = function() {
		setup_local_model();
		setup_controller();
		setup_home_view();
		controller.notify('activate', 'home');
	};
} (window.vfw = window.vfw || {}, window.$);

try {
	window.document.addEventListener('DOMContentLoaded', vfw.initialize, false);	
} catch (e) {
	console.log(e.message, 'in file:', e.fileName, 'on line:', e.lineNumber);
}