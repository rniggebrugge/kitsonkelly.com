require([
	"dojo/_base/array",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/ready",
	"dojo/request",
	"dojo/router",
	"dijit/Tooltip",
	"kitsonkelly/LastFMPager"
], function(array, dom, domConst, on, ready, request, router, Tooltip, LastFMPager){

	app = {
		tooltips: [],
		items: ["item01", "item02", "item03", "item04", "item05", "item06", "item07",
				"item11", "item12", "item13", "item14", "item15", "item16", "item17"],
		pages: {}
	};

	function connectItems(){
		if(dom.byId("labelcontent")){
			array.forEach(app.items, function(item){
				app.tooltips.push(new Tooltip({
					connectId: item,
					label: dom.byId(item + "content").innerHTML
				}));
			});

			domConst.empty("labelcontent");
		}
	}

	function initLastFM(){
		if(dom.byId("lastFM")){
			request.get("/lastfm", {
				handleAs: "json"
			}).then(function(response){
				app.lastFMPager = new LastFMPager({
					data: response
				}, "lastFM");
			});
		}
	}

	function loadPage(page){
		function placePage(response){
			domConst.place('<div id="section">' + response.content + '</div>', "section", "replace");
			domConst.place('<div id="header"><h1>' + response.title + '</h1><p>' + response.subtitle + '</p></div>', "header", "replace");
			if(response.connectItems){
				connectItems();
			}
			if(response.nav){
				domConst.place(response.nav, "header", "after");
			}
			initLastFM();
		}

		if(dom.byId("dl")){
			domConst.destroy("dl");
		}
		while(app.tooltips.length){
			var tooltip = app.tooltips.pop();
			tooltip.destroyRecursive();
		}
		if(app.pages[page]){
			placePage(app.pages[page]);
		}else{
			request.get("/page/" + page,{
				handleAs: "json"
			}).then(function(response){
				app.pages[page] = response;
				placePage(response);
			});
		}
	}

	ready(function(){
		connectItems();
		initLastFM();

		router.register("", function(){
			loadPage("home");
		});

		router.register("dojo", function(){
			loadPage("dojo");
		});

		router.register("cv", function(){
			loadPage("cv");
		});

		router.startup();

		on(dom.byId("navhome"), "click", function(evt){
			evt.preventDefault();
			router.go("");
		});

		on(dom.byId("navdojo"), "click", function(evt){
			evt.preventDefault();
			router.go("dojo");
		});

		on(dom.byId("navcv"), "click", function(evt){
			evt.preventDefault();
			router.go("cv");
		});

	});
});