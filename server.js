/*!
 * kitsonkelly.com
 * Server Module
 */

// Initial Module to Load
var initModule = "kitsonkelly/server/main";

// Dojo Configuration
dojoConfig = {
	async: true,
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
