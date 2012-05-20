require(["dojo/request", "dojo/json"], function(request, JSON){
	request.get("http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=kitsonk&api_key=b25b959554ed76058ac220b7b2e0a026", {
		handleAs: "xml"
	}).then(function(response){
		console.log(JSON.stringify(response.data));
	}, function(err){
		console.log(err);
	});
});
