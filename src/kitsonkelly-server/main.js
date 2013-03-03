define([
	"dojo/node!express",
	"dojo/node!jade",
	"dojo/node!stylus",
	"dojo/node!nib",
	"dojo/node!colors",
	"dojo/Deferred",
	"dojo/promise/all",
	"./as"
], function(express, jade, stylus, nib, colors, Deferred, all, as){

	/* Setup Express Server */
	var app = express(),
		appPort = process.env.PORT || 8001,
		env = process.env.NODE_ENV || "development",
		root = '/lib';

	function compile(str, path){
		return stylus(str).
			set("filename", path).
			use(nib());
	}

	app.configure(function(){
		app.locals.pretty = true;
		app.set("view engine", "jade");
		app.set("views", "views");
		app.use(express.logger(env && env == "production" ? null : "dev"));
		app.use(express.compress());
		app.use(express.cookieParser());
		app.use(express.cookieSession({ secret: "yHCoyEPZ9WsNDORGb9SDDMNn0OOMcCgQiW5q8VFhDHJiztvvVVCPkZQWUAXl" }));
		app.use(express.favicon("./images/favicon.ico"));
		app.use(app.router);
		
		app.use(stylus.middleware({
			src: ".",
			compile: compile,
			compress: true
		}));

		app.use("/src", express["static"]("./src"));
		app.use("/lib", express["static"]("./lib"), { maxAge: 86400000 });
		app.use("/css", express["static"]("./css"), { maxAge: 86400000 });
		app.use("/images", express["static"]("./images"), { maxAge: 86400000 });
		app.use("/static", express["static"]("./static"), { maxAge: 86400000 });
		
		app.use("/500", function(request, response, next){
			next(new Error("All your base are belong to us!"));
		});

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
			response.render('500', {
				error: error
			});
		});
	});

	app.get('/', function(request, response, next){
		response.render('index', {
			root: root
		});
	});

	app.get('/cv', function(request, response, next){
		response.render('cv', {
			root: root
		});
	});

	app.get('/dojo', function(request, response, next){
		response.render('dojo', {
			root: root
		});
	});

	app.get("/content/:view", function(request, response, next){
		response.render("content/" + request.params.view);
	});

	app.get("/page/:page", function(request, response, next){
		var d = new Deferred();
		jade.renderFile("views/content/" + request.params.page + ".jade", {}, function(err, page){
			if(err){
				d.reject(err);
			}else{
				d.resolve(page);
			}
		});
		if(request.params.page == "cv"){
			var d2 = new Deferred();
			jade.renderFile("views/content/cv_nav.jade", {}, function(err, page){
				if(err){
					d2.reject(err);
				}else{
					d2.resolve(page);
				}
			});
			d = all([d, d2]);
		}
		d.then(function(page){
			var result = {
				title: "Kitson P. Kelly"
			};
			if(page instanceof Array){
				result.content = page[0];
				result.nav = page[1];
			}else{
				result.content = page;
			}
			switch(request.params.page){
				case "home":
					result.connectItems = true;
					result.subtitle = "presence on the interwebs";
					break;
				case "dojo":
					result.connectItems = false;
					result.subtitle = "dojo toolkit";
					break;
				case "cv":
					result.connectItems = false;
					result.subtitle = "curriculum vitae/résumé";
			}
			response.json(result);
		}, function(err){
			next(err);
		});
	});

	app.get('/views/:view', function(request, response, next){
		response.render(request.params.view, {
			root: root,
			url: '/foo',
			error: new Error('All your base are belong to us!')
		});
	});

	app.get('/lastfm', function(request, response, next){
		as().then(function(reply){
			response.json(reply);
		}, function(err){
			next(err);
		});
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
		// TODO: Handle different response encodings (html/json)
		next(new Error('All your base are belong to us!'));
	});

	app.listen(appPort);

	console.log('HTTP server started on port '.grey + appPort.toString().cyan);
});