/*!
 * kitsonkelly.com
 * Server Module
 */

// Initial Module to Load
var initModule = 'kitsonkelly-server/main';

// Dojo Configuration
dojoConfig = {
	baseUrl: 'src/',
	async: 1,

	hasCache: {
		'host-node': 1,
		'dom': 0
	},

	packages: [ 'dojo', 'kitsonkelly-server', 'core', 'setten' ],

	deps: [ initModule ]
};

// Load dojo/dojo
require('./src/dojo/dojo.js');
