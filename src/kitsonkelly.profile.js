var profile = (function(){
	return {
		layerOptimize: "comments",
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
            hasCache: {},
			async: 1
		},

		staticHasFeatures: {
			"dojo-cdn":-1,
			"extend-dojo":1,
			"dojo-amd-factory-scan":0,
			"dojo-built":1,
			"dojo-combo-api":0,
			"dojo-log-api":1,
			"dojo-test-sniff":0,// must be turned on for several tests to work
			"dojo-config-addOnLoad":1,
			"dojo-config-api":1,
			"dojo-config-require":1,
			"dojo-dom-ready-api":1,
			"dojo-guarantee-console":1,
			"dojo-has-api":1,
			"dojo-inject-api":1,
			"dojo-loader":1,
			"dojo-modulePaths":1,
			"dojo-moduleUrl":1,
			"dojo-publish-privates":0,
			"dojo-requirejs-api":0,
			"dojo-sniff":-1,
			"dojo-sync-loader":1,
			"dojo-timeout-api":1,
			"dojo-trace-api":1,
			"dojo-undef-api":0,
			"dojo-v1x-i18n-Api":1,
			"dojo-xhr-factory":1,
			"dojo-fast-sync-require":1,
			"config-deferredInstrumentation":1,
			"dom":-1,
			"host-browser":-1,
			"host-node":-1,
			"host-rhino":0
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
