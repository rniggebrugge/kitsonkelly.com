/*!
 * kitsonkelly.com
 * Server Module
 */

// Initial Module to Load
var initModule = "kitsonkelly/server/main";

// Dojo Configuration
dojoConfig = {
	hasCache: {
		"host-node": 1,
		"dom": 0,
		"dojo-built": 1
	},
	trace: 1,
	async: 1,
	baseUrl: "src/",
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
	deps: [initModule]
}

// Load dojo/dojo
require("./src/dojo/dojo.js");
