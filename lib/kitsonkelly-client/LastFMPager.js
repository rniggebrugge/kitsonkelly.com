require({cache:{
'url:kitsonkelly-client/resources/_LastFMPane.html':"<div></div>"}});
define("kitsonkelly-client/LastFMPager", [
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/layout/StackContainer",
	"dojo/text!./resources/_LastFMPane.html"
], function(declare, _WidgetBase, _TemplatedMixin, StackContainer, template){

	var _LastFMPane = declare([_WidgetBase, _TemplatedMixin], {
		template: template
	});

	return declare([StackContainer],{
		store: null,

		

		refresh: function(){

		}
	});
});