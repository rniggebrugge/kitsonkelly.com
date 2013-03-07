var profile = (function () {
	return {
		releaseDir: '../lib',
		basePath: 'src',
		action: 'release',
		mini: true,
		layerOptimize: 'closure',
		cssOptimize: 'comments',
		selectorEngine: 'lite',

		packages: [{
			name: 'dojo',
			location: 'dojo'
		},{
			name: 'dijit',
			location: 'dijit'
		},{
			name: 'kitsonkelly-client',
			location: 'kitsonkelly-client'
		}],

		defaultConfig: {
			hasCache: {
				'dojo-built': 1,
				'dojo-loader': 1,
				'dom': 1,
				'host-browser': 1,
				'config-selectorEngine': 'lite'
			},
			async: 1
		},

		staticHasFeatures: {
			'config-dojo-loader-catches': 0,
			'config-tlmSiblingOfDojo': 0,
			'dojo-log-api': 0,
			'dojo-sync-loader': 0,
			'dojo-timeout-api': 0,
			'dojo-sniff': 0,
			'dojo-cdn': 0,
			'config-strip-strict': 0,
			'dojo-loader-eval-hint-url': 1,
			'dojo-firebug': 0,
			'native-xhr': 1,
			'dojo-debug-messages': 0,
			'quirks': 0,
			'dijit-legacy-requires': 0,
			'opera': 0
		},

		layers: {
			'dojo/dojo': {
				include: [ 'dojo/dojo', 'kitsonkelly-client/main' ],
				customBase: 1,
				boot: 1
			}
		}
	};
})();