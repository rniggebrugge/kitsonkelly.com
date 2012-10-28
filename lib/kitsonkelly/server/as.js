define("kitsonkelly/server/as", [
	"dojo/Deferred",
	"dojo/request",
	"dojo/request/handlers",
	"dojo/node!xml2js"
], function(Deferred, request, handlers, xml2js){

	var server = "ws.audioscrobbler.com",
		method = "user.getrecenttracks",
		user = "kitsonk",
		apiKey = "b25b959554ed76058ac220b7b2e0a026";

	handlers.register("xml2js", function(response){
		var parser = new xml2js.Parser(),
			d = new Deferred();
		parser.parseString(response.text, function(err, result){
			if(err) d.reject(err);
			d.resolve(result);
		});
		return d;
	});

	return function(){
		return request.get("http://" + server + "/2.0/?method=" + method + "&user=" + user + "&api_key=" + apiKey, {
			handleAs: "xml2js"
		}).then(function(result){
			return result;
		});
	};
});
