define([
	'dojo/node!express',
	'dojo/node!compression',
	'dojo/node!morgan',
	'dojo/node!cookie-parser',
	'dojo/node!cookie-session',
	'dojo/node!serve-favicon',
	'dojo/node!serve-static',
	'dojo/node!jade',
	'dojo/node!stylus',
	'dojo/node!nib',
	'dojo/node!colors',
	'dojo/node!gm',
	'dojo/Deferred',
	'dojo/promise/all',
	'setten/dfs'
], function(express, compress, morgan, cookieParser, cookieSession, favicon, serveStatic, jade, stylus, nib, colors,
		gm, Deferred, all, dfs){

	/* Setup Express Server */
	var app = express(),
		appPort = process.env.PORT || 8001,
		env = process.env.NODE_ENV || 'development',
		root = '/lib';

	function compile(str, path){
		return stylus(str).
			set('filename', path).
			set('compress', true).
			use(nib());
	}

	app.set('view engine', 'jade');
	app.set('views', 'views');
	app.use(compress());
	app.use(morgan(env === 'production' ? null : 'dev'));
	app.use(cookieParser());
	app.use(cookieSession({ secret: 'yHCoyEPZ9WsNDORGb9SDDMNn0OOMcCgQiW5q8VFhDHJiztvvVVCPkZQWUAXl' }));
	app.use(favicon('./images/favicon.ico'));

	app.use(stylus.middleware({
		src: '.',
		compile: compile,
		compress: true
	}));

	app.use('/src', serveStatic('./src'));
	app.use('/lib', serveStatic('./lib', { maxAge: 86400000 }));
	app.use('/css', serveStatic('./css', { maxAge: 86400000 }));
	app.use('/images', serveStatic('./images', { maxAge: 86400000 }));
	app.use('/photos/full', serveStatic('./photos', { maxAge: 86400000 }));
	app.use('/static', serveStatic('./static', { maxAge: 86400000 }));

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

	app.get('/code', function(request, response, next){
		response.render('code', {
			root: root
		});
	});

	app.get('/photos', function (request, response, next) {
		response.render('photos', {
			root: root
		});
	});

	function resize(image) {

		var parts = image.split('.'),
			ext = parts.pop();
		parts.push('thumb');
		parts.push(ext);
		var thumb = parts.join('.');
		return dfs.exists(thumb).then(function (exists) {
			var dfd = new Deferred();

			function writeFile(err) {
				if (err) {
					dfd.reject(err);
					return;
				}
				dfd.resolve(thumb);
			}

			if (exists) {
				dfd.resolve(thumb);
			}
			else {
				gm(image).
					size(function (err, size) {
						if (err) {
							dfd.reject(err);
							return;
						}
						if (size.width > size.height) {
							gm(image).
								resize(333, 222).
								write(thumb, writeFile);
						}
						else {
							gm(image).
								resize(222, 333).
								noProfile().
								write(thumb, writeFile);
						}
					});
			}
			return dfd.promise;
		});
	}

	app.get('/photos/thumb/:image', function (request, response, next) {
		resize('photos/' + request.params.image).then(function (filename) {
			response.sendfile(filename);
		});
	});

	app.get('/content/:view', function(request, response, next){
		response.render('content/' + request.params.view);
	});

	app.get('/page/:page', function(request, response, next){
		var d = new Deferred();
		jade.renderFile('views/content/' + request.params.page + '.jade', {}, function(err, page){
			if(err){
				d.reject(err);
			}else{
				d.resolve(page);
			}
		});
		if(request.params.page == 'cv'){
			var d2 = new Deferred();
			jade.renderFile('views/content/cv_nav.jade', {}, function(err, page){
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
				title: 'Kitson P. Kelly'
			};
			if(page instanceof Array){
				result.content = page[0];
				result.nav = page[1];
			}else{
				result.content = page;
			}
			switch(request.params.page){
				case 'home':
					result.connectItems = true;
					result.subtitle = 'presence on the interwebs';
					break;
				case 'dojo':
					result.connectItems = false;
					result.subtitle = 'dojo toolkit';
					break;
				case 'cv':
					result.connectItems = false;
					result.subtitle = 'curriculum vitae/résumé';
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
		next(new Error('All your base are belong to us!'));
	});

	app.use(function(request, response, next){
		if(request.accepts('html')){
			response.status(404);
			response.render('404', {
				url: request.url,
				root: root
			});
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
			error: error,
			root: root
		});
	});


	app.listen(appPort);

	console.log('HTTP server started on port '.grey + appPort.toString().cyan);
});
