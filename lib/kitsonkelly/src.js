require([
	"dojo/_base/array",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/ready",
	"dijit/Tooltip"
], function(array, dom, domConst, ready, Tooltip){
	app = {
		tooltips: [],
		items: ["item01", "item02", "item03", "item04", "item05", "item06", "item07",
				"item11", "item12", "item13", "item14", "item15", "item16", "item17"]
	};
	ready(function(){
		array.forEach(app.items, function(item){
			app.tooltips.push(new Tooltip({
				connectId: item,
				label: dom.byId(item + "content").innerHTML
			}));
		});
		domConst.empty("labelcontent");
	});
})