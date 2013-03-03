define([
	"dojo/Deferred",
	"dojo/request",
	"dojo/request/handlers",
	"dojo/node!xml2js"
], function(Deferred, request, handlers, xml2js){

	var server = "ws.audioscrobbler.com",
		method = "user.getrecenttracks",
		user = "kitsonk",
		apiKey = "f58131afcb62f56e2abc82f1bf2dbc09";

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
			var tracks = [];
			result.recenttracks.track.forEach(function(track){
				var t = {
					artist: track.artist["#"],
					name: track.name,
					streamable: track.streamable === "1" ? true : false,
					image: {},
					date: parseInt(track.date["@"].uts, 10)
				};
				track.image.forEach(function(image){
					t.image[image["@"].size] = image["#"];
				});
				tracks.push(t);
			});
			return tracks;
		});
	};
});
