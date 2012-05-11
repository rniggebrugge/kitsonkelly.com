var http = require('http');

var server = http.createSever(function(req, res){
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.writeEnd("Hello world\n");
});

server.listen(process.env.PORT || 8001);
