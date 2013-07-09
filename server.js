/*!
 * kitsonkelly.com
 * Server Module
 */

// Initial Module to Load
var initModule = "kitsonkelly-server/main";

// Dojo Configuration
dojoConfig = {
	baseUrl: "src/",
	async: 1,

	hasCache: {
		"host-node": 1,
		"dom": 0
	},

	packages: [{
		name: "dojo",
		location: "dojo"
	},{
		name: "dijit",
		location: "dijit"
	},{
		name: "kitsonkelly-server",
		location: "kitsonkelly-server"
	},{
		name: 'setten',
		location: 'setten'
	}],

	deps: [initModule]
};

// Load dojo/dojo
require("./src/dojo/dojo.js");
