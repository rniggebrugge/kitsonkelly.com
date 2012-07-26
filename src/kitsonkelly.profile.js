var profile = (function(){
	return {
		layerOptimize: "closure",
		cssOptimize: "comments",
		mini: true,
		optimize: "closure",
		selectorEngine: "lite",
		releaseDir: "../lib",
		action: "release",

		packages: [{
			name: "dojo",
			location: "dojo"
		},{
			name: "dijit",
			location: "dijit"
		},{
			name: "dojox",
			location: "dojox"
		},{
			name: "kitsonkelly",
			location: "kitsonkelly"
		}],

		defaultConfig: {
			async: 1
		},

		layers: {
			"dojo/dojo": {
				include: [],
				customBase: 1,
				boot: 1
			},
			"kitsonkelly/server/main": {
				include: [],
				exclude: []
			},
			"kitsonkelly/src": {
				include: [],
				exclude: []
			}
		}
	};
})();
