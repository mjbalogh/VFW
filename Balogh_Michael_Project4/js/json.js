var fixture = {
	"Bash": {
		"10000141041410414": {
			"name": "My First Bash Snippet",
			"added_on": "2012-04-24",
			"relevance": 86,
			"favorite": "Yes",
			"codebase": "My first bash code"
		}
	},	
	"CSS": {
		"11000141041410421": {
			"name": "My First CSS Snippet",
			"added_on": "2012-03-24",
			"relevance": 27,
			"favorite": "Yes",
			"codebase": "CSS snippet 1 code"
		},
		"11000141041410422": {
			"name": "My Second CSS Snippet",
			"added_on": "2012-03-25",
			"relevance": 56,
			"favorite": "Yes",
			"codebase": "CSS snippet 2 code"
		},
		"11000141041410423": {
			"name": "My Third CSS Snippet",
			"added_on": "2012-03-26",
			"relevance": 32,
			"favorite": "Yes",
			"codebase": "CSS snippet 3 code"
		}
	},
	"HTML": {
		"12000141041410421": {
			"name": "My First HTML Snippet",
			"added_on": "2011-03-24",
			"relevance": 29,
			"favorite": "Yes",
			"codebase": "HTML snippet 1 code"
		},
		"12000141041410422": {
			"name": "My Second HTML Snippet",
			"added_on": "2011-03-25",
			"relevance": 62,
			"favorite": "No",
			"codebase": "HTML snippet 2 code"
		},
		"12000141041410423": {
			"name": "My third HTML Snippet",
			"added_on": "2011-03-26",
			"relevance": 72,
			"favorite": "Yes",
			"codebase": "HTML snippet 3 code"
		},
		"12000141041410424": {
			"name": "My fourth HTML Snippet",
			"added_on": "2011-03-25",
			"relevance": 62,
			"favorite": "No",
			"codebase": "HTML snippet 4 code"
		},
		"12000141041410425": {
			"name": "My fifth HTML Snippet",
			"added_on": "2011-03-26",
			"relevance": 72,
			"favorite": "Yes",
			"codebase": "HTML snippet 5 code"
		}
	}
};

function loadFixtures () {
	localStorage.clear();
		
	for (var key in fixture) {
		if (fixture.hasOwnProperty(key)) {
			console.log(key);
			console.log(fixture[key]);
			localStorage.setItem(key, JSON.stringify(fixture[key]));
		}
	}
};