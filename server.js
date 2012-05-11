/*!
 * kitsonkelly.com
 * Server Module
 */

var util = require('util'),
    express = require('express');

var app = express.createServer(),
	appPort = process.env.PORT || 8001;

app.configure(function(){
	app.set('view options', { layout: false });
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'yHCoyEPZ9WsNDORGb9SDDMNn0OOMcCgQiW5q8VFhDHJiztvvVVCPkZQWUAXl' }));
	app.use(app.router);
	app.use('/lib/dojo', express.static('../dojo'));
	app.use('/lib/dijit', express.static('../dijit'));
	app.use('/lib/dojox', express.static('../dojox'));
	app.use('/lib', express.static('./lib'));
	app.use('/css', express.static('./css'));
	app.use('/images', express.static('./images'));
});

app.get('/', function(request, response, next){
	response.render('404.jade', { status: 404, res: request.url });
})

app.listen(appPort);

util.puts('HTTP server started on port ' + appPort);
