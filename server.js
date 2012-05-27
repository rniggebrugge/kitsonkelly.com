/*!
 * kitsonkelly.com
 * Server Module
 */

var util = require('util'),
    express = require('express');

var app = express.createServer(),
	appPort = process.env.PORT || 8001;

function NotFound(msg){
  this.name = "Not Found";
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;

app.configure(function(){
	app.set('view options', { layout: false });
	app.set('view engine', 'jade');
	app.use(express.favicon('./images/favicon.ico'));
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'yHCoyEPZ9WsNDORGb9SDDMNn0OOMcCgQiW5q8VFhDHJiztvvVVCPkZQWUAXl' }));
	app.use(app.router);
	
	app.use('/lib/dojo', express.static('../dojo'));
	app.use('/lib/dijit', express.static('../dijit'));
	app.use('/lib/dojox', express.static('../dojox'));
	app.use('/lib', express.static('./lib'));
	app.use('/css', express.static('./css'));
	app.use('/images', express.static('./images'));
	app.use('/static', express.static('./static'));
	
	app.use(function(request, response, next){
	  if(request.accepts('html')){
	    response.status(404);
	    response.render('404', { url: request.url });
	    return;
	  }
	  
	  if(request.accepts('json')){
	    response.send({ error: 'Not Found' });
	    return;
	  }
	  
	  response.type('txt').send('Not Found');
	});
	
	app.use(function(error, request, response, next){
	  response.status(error.status || 500);
	  response.render('500', { error: error });
	});
});

app.get('/', function(request, response, next){
	response.render('index');
});

app.get('/cv', function(request, response, next){
  response.render('cv');
});

app.get('/dojo', function(request, response, next){
  response.render('dojo');
});

app.get('/404', function(request, response, next){
  next();
});

app.get('/403', function(request, response, next){
  var error = new Error('not allowed!');
  error.status = 403;
  next(error);
});

app.get('/500', function(request, response, next){
  next(new Error('All your base are belong to us!'));
});

app.listen(appPort);

util.puts('HTTP server started on port ' + appPort);
