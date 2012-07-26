require({cache:{
'url:kitsonkelly/resources/_LastFMPane.html':"undefined"}});
define("kitsonkelly/LastFMPager", [
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/layout/_LayoutWidget",
	"dojo/text!./resources/_LastFMPane.html"
], function(declare, _WidgetBase, _TemplatedMixin, _LayoutWidget, template){

	var _LastFMPane = declare([_WidgetBase, _TemplatedMixin], {
		template: template
	});

	return declare([_LayoutWidget],{
		data: null
	});
});