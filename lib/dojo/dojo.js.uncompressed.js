(function(
	userConfig,
	defaultConfig
){
	// summary:
	//		This is the "source loader" and is the entry point for Dojo during development. You may also load Dojo with
	//		any AMD-compliant loader via the package main module dojo/main.
	// description:
	//		This is the "source loader" for Dojo. It provides an AMD-compliant loader that can be configured
	//		to operate in either synchronous or asynchronous modes. After the loader is defined, dojo is loaded
	//		IAW the package main module dojo/main. In the event you wish to use a foreign loader, you may load dojo as a package
	//		via the package main module dojo/main and this loader is not required; see dojo/package.json for details.
	//
	//		In order to keep compatibility with the v1.x line, this loader includes additional machinery that enables
	//		the dojo.provide, dojo.require et al API. This machinery is loaded by default, but may be dynamically removed
	//		via the has.js API and statically removed via the build system.
	//
	//		This loader includes sniffing machinery to determine the environment; the following environments are supported:
	//
	//		- browser
	//		- node.js
	//		- rhino
	//
	//		This is the so-called "source loader". As such, it includes many optional features that may be discarded by
	//		building a customized version with the build system.

	// Design and Implementation Notes
	//
	// This is a dojo-specific adaption of bdLoad, donated to the dojo foundation by Altoviso LLC.
	//
	// This function defines an AMD-compliant (http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition)
	// loader that can be configured to operate in either synchronous or asynchronous modes.
	//
	// Since this machinery implements a loader, it does not have the luxury of using a load system and/or
	// leveraging a utility library. This results in an unpleasantly long file; here is a road map of the contents:
	//
	//	 1. Small library for use implementing the loader.
	//	 2. Define the has.js API; this is used throughout the loader to bracket features.
	//	 3. Define the node.js and rhino sniffs and sniff.
	//	 4. Define the loader's data.
	//	 5. Define the configuration machinery.
	//	 6. Define the script element sniffing machinery and sniff for configuration data.
	//	 7. Configure the loader IAW the provided user, default, and sniffing data.
	//	 8. Define the global require function.
	//	 9. Define the module resolution machinery.
	//	10. Define the module and plugin module definition machinery
	//	11. Define the script injection machinery.
	//	12. Define the window load detection.
	//	13. Define the logging API.
	//	14. Define the tracing API.
	//	16. Define the AMD define function.
	//	17. Define the dojo v1.x provide/require machinery--so called "legacy" modes.
	//	18. Publish global variables.
	//
	// Language and Acronyms and Idioms
	//
	// moduleId: a CJS module identifier, (used for public APIs)
	// mid: moduleId (used internally)
	// packageId: a package identifier (used for public APIs)
	// pid: packageId (used internally); the implied system or default package has pid===""
	// pack: package is used internally to reference a package object (since javascript has reserved words including "package")
	// prid: plugin resource identifier
	// The integer constant 1 is used in place of true and 0 in place of false.

	// define a minimal library to help build the loader
	var	noop = function(){
		},

		isEmpty = function(it){
			for(var p in it){
				return 0;
			}
			return 1;
		},

		toString = {}.toString,

		isFunction = function(it){
			return toString.call(it) == "[object Function]";
		},

		isString = function(it){
			return toString.call(it) == "[object String]";
		},

		isArray = function(it){
			return toString.call(it) == "[object Array]";
		},

		forEach = function(vector, callback){
			if(vector){
				for(var i = 0; i < vector.length;){
					callback(vector[i++]);
				}
			}
		},

		mix = function(dest, src){
			for(var p in src){
				dest[p] = src[p];
			}
			return dest;
		},

		makeError = function(error, info){
			return mix(new Error(error), {src:"dojoLoader", info:info});
		},

		uidSeed = 1,

		uid = function(){
			// Returns a unique identifier (within the lifetime of the document) of the form /_d+/.
			return "_" + uidSeed++;
		},

		// FIXME: how to doc window.require() api

		// this will be the global require function; define it immediately so we can start hanging things off of it
		req = function(
			config,		  //(object, optional) hash of configuration properties
			dependencies, //(array of commonjs.moduleId, optional) list of modules to be loaded before applying callback
			callback	  //(function, optional) lambda expression to apply to module values implied by dependencies
		){
			return contextRequire(config, dependencies, callback, 0, req);
		},

		// the loader uses the has.js API to control feature inclusion/exclusion; define then use throughout
		global = this,

		doc = global.document,

		element = doc && doc.createElement("DiV"),

		has = req.has = function(name){
			return isFunction(hasCache[name]) ? (hasCache[name] = hasCache[name](global, doc, element)) : hasCache[name];
		},

		hasCache = has.cache = defaultConfig.hasCache;

	has.add = function(name, test, now, force){
		(hasCache[name]===undefined || force) && (hasCache[name] = test);
		return now && has(name);
	};

	 0 && has.add("host-node", userConfig.has && "host-node" in userConfig.has ?
		userConfig.has["host-node"] :
		(typeof process == "object" && process.versions && process.versions.node && process.versions.v8));
	if( 0 ){
		// fixup the default config for node.js environment
		require("./_base/configNode.js").config(defaultConfig);
		// remember node's require (with respect to baseUrl==dojo's root)
		defaultConfig.loaderPatch.nodeRequire = require;
	}

	 0 && has.add("host-rhino", userConfig.has && "host-rhino" in userConfig.has ?
		userConfig.has["host-rhino"] :
		(typeof load == "function" && (typeof Packages == "function" || typeof Packages == "object")));
	if( 0 ){
		// owing to rhino's lame feature that hides the source of the script, give the user a way to specify the baseUrl...
		for(var baseUrl = userConfig.baseUrl || ".", arg, rhinoArgs = this.arguments, i = 0; i < rhinoArgs.length;){
			arg = (rhinoArgs[i++] + "").split("=");
			if(arg[0] == "baseUrl"){
				baseUrl = arg[1];
				break;
			}
		}
		load(baseUrl + "/_base/configRhino.js");
		rhinoDojoConfig(defaultConfig, baseUrl, rhinoArgs);
	}

	// userConfig has tests override defaultConfig has tests; do this after the environment detection because
	// the environment detection usually sets some has feature values in the hasCache.
	for(var p in userConfig.has){
		has.add(p, userConfig.has[p], 0, 1);
	}

	//
	// define the loader data
	//

	// the loader will use these like symbols if the loader has the traceApi; otherwise
	// define magic numbers so that modules can be provided as part of defaultConfig
	var	requested = 1,
		arrived = 2,
		nonmodule = 3,
		executing = 4,
		executed = 5;

	if( 0 ){
		// these make debugging nice; but using strings for symbols is a gross rookie error; don't do it for production code
		requested = "requested";
		arrived = "arrived";
		nonmodule = "not-a-module";
		executing = "executing";
		executed = "executed";
	}

	var legacyMode = 0,
		sync = "sync",
		xd = "xd",
		syncExecStack = [],
		dojoRequirePlugin = 0,
		checkDojoRequirePlugin = noop,
		transformToAmd = noop,
		getXhr;
	if( 0 ){
		req.isXdUrl = noop;

		req.initSyncLoader = function(dojoRequirePlugin_, checkDojoRequirePlugin_, transformToAmd_){
			// the first dojo/_base/loader loaded gets to define these variables; they are designed to work
			// in the presence of zero to many mapped dojo/_base/loaders
			if(!dojoRequirePlugin){
				dojoRequirePlugin = dojoRequirePlugin_;
				checkDojoRequirePlugin = checkDojoRequirePlugin_;
				transformToAmd = transformToAmd_;
			}

			return {
				sync:sync,
				requested:requested,
				arrived:arrived,
				nonmodule:nonmodule,
				executing:executing,
				executed:executed,
				syncExecStack:syncExecStack,
				modules:modules,
				execQ:execQ,
				getModule:getModule,
				injectModule:injectModule,
				setArrived:setArrived,
				signal:signal,
				finishExec:finishExec,
				execModule:execModule,
				dojoRequirePlugin:dojoRequirePlugin,
				getLegacyMode:function(){return legacyMode;},
				guardCheckComplete:guardCheckComplete
			};
		};

		if( 1 ){
			// in legacy sync mode, the loader needs a minimal XHR library

			var locationProtocol = location.protocol,
				locationHost = location.host;
			req.isXdUrl = function(url){
				if(/^\./.test(url)){
					// begins with a dot is always relative to page URL; therefore not xdomain
					return false;
				}
				if(/^\/\//.test(url)){
					// for v1.6- backcompat, url starting with // indicates xdomain
					return true;
				}
				// get protocol and host
				// \/+ takes care of the typical file protocol that looks like file:///drive/path/to/file
				// locationHost is falsy if file protocol => if locationProtocol matches and is "file:", || will return false
				var match = url.match(/^([^\/\:]+\:)\/+([^\/]+)/);
				return match && (match[1] != locationProtocol || (locationHost && match[2] != locationHost));
			};


			// note: to get the file:// protocol to work in FF, you must set security.fileuri.strict_origin_policy to false in about:config
			 1 || has.add("dojo-xhr-factory", 1);
			has.add("dojo-force-activex-xhr",  1  && !doc.addEventListener && window.location.protocol == "file:");
			 1 || has.add("native-xhr", typeof XMLHttpRequest != "undefined");
			if( 1  && !has("dojo-force-activex-xhr")){
				getXhr = function(){
					return new XMLHttpRequest();
				};
			}else{
				// if in the browser an old IE; find an xhr
				for(var XMLHTTP_PROGIDS = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'], progid, i = 0; i < 3;){
					try{
						progid = XMLHTTP_PROGIDS[i++];
						if(new ActiveXObject(progid)){
							// this progid works; therefore, use it from now on
							break;
						}
					}catch(e){
						// squelch; we're just trying to find a good ActiveX progid
						// if they all fail, then progid ends up as the last attempt and that will signal the error
						// the first time the client actually tries to exec an xhr
					}
				}
				getXhr = function(){
					return new ActiveXObject(progid);
				};
			}
			req.getXhr = getXhr;

			has.add("dojo-gettext-api", 1);
			req.getText = function(url, async, onLoad){
				var xhr = getXhr();
				xhr.open('GET', fixupUrl(url), false);
				xhr.send(null);
				if(xhr.status == 200 || (!location.host && !xhr.status)){
					if(onLoad){
						onLoad(xhr.responseText, async);
					}
				}else{
					throw makeError("xhrFailed", xhr.status);
				}
				return xhr.responseText;
			};
		}
	}else{
		req.async = 1;
	}

	//
	// loader eval
	//
	var eval_ =
		// use the function constructor so our eval is scoped close to (but not in) in the global space with minimal pollution
		new Function('return eval(arguments[0]);');

	req.eval =
		function(text, hint){
			return eval_(text + "\r\n////@ sourceURL=" + hint);
		};

	//
	// loader micro events API
	//
	var listenerQueues = {},
		error = "error",
		signal = req.signal = function(type, args){
			var queue = listenerQueues[type];
			// notice we run a copy of the queue; this allows listeners to add/remove
			// other listeners without affecting this particular signal
			forEach(queue && queue.slice(0), function(listener){
				listener.apply(null, isArray(args) ? args : [args]);
			});
		},
		on = req.on = function(type, listener){
			// notice a queue is not created until a client actually connects
			var queue = listenerQueues[type] || (listenerQueues[type] = []);
			queue.push(listener);
			return {
				remove:function(){
					for(var i = 0; i<queue.length; i++){
						if(queue[i]===listener){
							queue.splice(i, 1);
							return;
						}
					}
				}
			};
		};

	// configuration machinery; with an optimized/built defaultConfig, all configuration machinery can be discarded
	// lexical variables hold key loader data structures to help with minification; these may be completely,
	// one-time initialized by defaultConfig for optimized/built versions
	var
		aliases
			// a vector of pairs of [regexs or string, replacement] => (alias, actual)
			= [],

		paths
			// CommonJS paths
			= {},

		pathsMapProg
			// list of (from-path, to-path, regex, length) derived from paths;
			// a "program" to apply paths; see computeMapProg
			= [],

		packs
			// a map from packageId to package configuration object; see fixupPackageInfo
			= {},

		map = req.map
			// AMD map config variable; dojo/_base/kernel needs req.map to figure out the scope map
			= {},

		mapProgs
			// vector of quads as described by computeMapProg; map-key is AMD map key, map-value is AMD map value
			= [],

		modules
			// A hash:(mid) --> (module-object) the module namespace
			//
			// pid: the package identifier to which the module belongs (e.g., "dojo"); "" indicates the system or default package
			// mid: the fully-resolved (i.e., mappings have been applied) module identifier without the package identifier (e.g., "dojo/io/script")
			// url: the URL from which the module was retrieved
			// pack: the package object of the package to which the module belongs
			// executed: 0 => not executed; executing => in the process of traversing deps and running factory; executed => factory has been executed
			// deps: the dependency vector for this module (vector of modules objects)
			// def: the factory for this module
			// result: the result of the running the factory for this module
			// injected: (0 | requested | arrived) the status of the module; nonmodule means the resource did not call define
			// load: plugin load function; applicable only for plugins
			//
			// Modules go through several phases in creation:
			//
			// 1. Requested: some other module's definition or a require application contained the requested module in
			//	  its dependency vector or executing code explicitly demands a module via req.require.
			//
			// 2. Injected: a script element has been appended to the insert-point element demanding the resource implied by the URL
			//
			// 3. Loaded: the resource injected in [2] has been evaluated.
			//
			// 4. Defined: the resource contained a define statement that advised the loader about the module. Notice that some
			//	  resources may just contain a bundle of code and never formally define a module via define
			//
			// 5. Evaluated: the module was defined via define and the loader has evaluated the factory and computed a result.
			= {},

		cacheBust
			// query string to append to module URLs to bust browser cache
			= "",

		cache
			// hash:(mid | url)-->(function | string)
			//
			// A cache of resources. The resources arrive via a config.cache object, which is a hash from either mid --> function or
			// url --> string. The url key is distinguished from the mid key by always containing the prefix "url:". url keys as provided
			// by config.cache always have a string value that represents the contents of the resource at the given url. mid keys as provided
			// by configl.cache always have a function value that causes the same code to execute as if the module was script injected.
			//
			// Both kinds of key-value pairs are entered into cache via the function consumePendingCache, which may relocate keys as given
			// by any mappings *iff* the config.cache was received as part of a module resource request.
			//
			// Further, for mid keys, the implied url is computed and the value is entered into that key as well. This allows mapped modules
			// to retrieve cached items that may have arrived consequent to another namespace.
			//
			 = {},

		urlKeyPrefix
			// the prefix to prepend to a URL key in the cache.
			= "url:",

		pendingCacheInsert
			// hash:(mid)-->(function)
			//
			// Gives a set of cache modules pending entry into cache. When cached modules are published to the loader, they are
			// entered into pendingCacheInsert; modules are then pressed into cache upon (1) AMD define or (2) upon receiving another
			// independent set of cached modules. (1) is the usual case, and this case allows normalizing mids given in the pending
			// cache for the local configuration, possibly relocating modules.
			 = {},

		dojoSniffConfig
			// map of configuration variables
			// give the data-dojo-config as sniffed from the document (if any)
			= {},

		insertPointSibling
			// the nodes used to locate where scripts are injected into the document
			= 0;

	if( 1 ){
		var consumePendingCacheInsert = function(referenceModule){
				var p, item, match, now, m;
				for(p in pendingCacheInsert){
					item = pendingCacheInsert[p];
					match = p.match(/^url\:(.+)/);
					if(match){
						cache[urlKeyPrefix + toUrl(match[1], referenceModule)] =  item;
					}else if(p=="*now"){
						now = item;
					}else if(p!="*noref"){
						m = getModuleInfo(p, referenceModule, true);
						cache[m.mid] = cache[urlKeyPrefix + m.url] = item;
					}
				}
				if(now){
					now(createRequire(referenceModule));
				}
				pendingCacheInsert = {};
			},

			escapeString = function(s){
				return s.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function(c){ return "\\" + c; });
			},

			computeMapProg = function(map, dest){
				// This routine takes a map as represented by a JavaScript object and initializes dest, a vector of
				// quads of (map-key, map-value, refex-for-map-key, length-of-map-key), sorted decreasing by length-
				// of-map-key. The regex looks for the map-key followed by either "/" or end-of-string at the beginning
				// of a the search source. Notice the map-value is irrelevant to the algorithm
				dest.splice(0, dest.length);
				for(var p in map){
					dest.push([
						p,
						map[p],
						new RegExp("^" + escapeString(p) + "(\/|$)"),
						p.length]);
				}
				dest.sort(function(lhs, rhs){ return rhs[3] - lhs[3]; });
				return dest;
			},

			computeAliases = function(config, dest){
				forEach(config, function(pair){
					// take a fixed-up copy...
					dest.push([isString(pair[0]) ? new RegExp("^" + escapeString(pair[0]) + "$") : pair[0], pair[1]]);
				});
			},


			fixupPackageInfo = function(packageInfo){
				// calculate the precise (name, location, main, mappings) for a package
				var name = packageInfo.name;
				if(!name){
					// packageInfo must be a string that gives the name
					name = packageInfo;
					packageInfo = {name:name};
				}
				packageInfo = mix({main:"main"}, packageInfo);
				packageInfo.location = packageInfo.location ? packageInfo.location : name;

				// packageMap is deprecated in favor of AMD map
				if(packageInfo.packageMap){
					map[name] = packageInfo.packageMap;
				}

				if(!packageInfo.main.indexOf("./")){
					packageInfo.main = packageInfo.main.substring(2);
				}

				// now that we've got a fully-resolved package object, push it into the configuration
				packs[name] = packageInfo;
			},

			delayedModuleConfig
				// module config cannot be consumed until the loader is completely initialized; therefore, all
				// module config detected during booting is memorized and applied at the end of loader initialization
				// TODO: this is a bit of a kludge; all config should be moved to end of loader initialization, but
				// we'll delay this chore and do it with a final loader 1.x cleanup after the 2.x loader prototyping is complete
				= [],


			config = function(config, booting, referenceModule){
				for(var p in config){
					if(p=="waitSeconds"){
						req.waitms = (config[p] || 0) * 1000;
					}
					if(p=="cacheBust"){
						cacheBust = config[p] ? (isString(config[p]) ? config[p] : (new Date()).getTime() + "") : "";
					}
					if(p=="baseUrl" || p=="combo"){
						req[p] = config[p];
					}
					if( 0  && p=="async"){
						// falsy or "sync" => legacy sync loader
						// "xd" => sync but loading xdomain tree and therefore loading asynchronously (not configurable, set automatically by the loader)
						// "legacyAsync" => permanently in "xd" by choice
						// "debugAtAllCosts" => trying to load everything via script injection (not implemented)
						// otherwise, must be truthy => AMD
						// legacyMode: sync | legacyAsync | xd | false
						var mode = config[p];
						req.legacyMode = legacyMode = (isString(mode) && /sync|legacyAsync/.test(mode) ? mode : (!mode ? sync : false));
						req.async = !legacyMode;
					}
					if(config[p]!==hasCache){
						// accumulate raw config info for client apps which can use this to pass their own config
						req.rawConfig[p] = config[p];
						p!="has" && has.add("config-"+p, config[p], 0, booting);
					}
				}

				// make sure baseUrl exists
				if(!req.baseUrl){
					req.baseUrl = "./";
				}
				// make sure baseUrl ends with a slash
				if(!/\/$/.test(req.baseUrl)){
					req.baseUrl += "/";
				}

				// now do the special work for has, packages, packagePaths, paths, aliases, and cache

				for(p in config.has){
					has.add(p, config.has[p], 0, booting);
				}

				// for each package found in any packages config item, augment the packs map owned by the loader
				forEach(config.packages, fixupPackageInfo);

				// for each packagePath found in any packagePaths config item, augment the packageConfig
				// packagePaths is deprecated; remove in 2.0
				for(baseUrl in config.packagePaths){
					forEach(config.packagePaths[baseUrl], function(packageInfo){
						var location = baseUrl + "/" + packageInfo;
						if(isString(packageInfo)){
							packageInfo = {name:packageInfo};
						}
						packageInfo.location = location;
						fixupPackageInfo(packageInfo);
					});
				}

				// notice that computeMapProg treats the dest as a reference; therefore, if/when that variable
				// is published (see dojo-publish-privates), the published variable will always hold a valid value.

				// this must come after all package processing since package processing may mutate map
				computeMapProg(mix(map, config.map), mapProgs);
				forEach(mapProgs, function(item){
					item[1] = computeMapProg(item[1], []);
					if(item[0]=="*"){
						mapProgs.star = item;
					}
				});

				// push in any paths and recompute the internal pathmap
				computeMapProg(mix(paths, config.paths), pathsMapProg);

				// aliases
				computeAliases(config.aliases, aliases);

				if(booting){
					delayedModuleConfig.push({config:config.config});
				}else{
					for(p in config.config){
						var module = getModule(p, referenceModule);
						module.config = mix(module.config || {}, config.config[p]);
					}
				}

				// push in any new cache values
				if(config.cache){
					consumePendingCacheInsert();
					pendingCacheInsert = config.cache;
					if(config.cache["*noref"]){
						consumePendingCacheInsert();
					}
				}

				signal("config", [config, req.rawConfig]);
			};

		//
		// execute the various sniffs; userConfig can override and value
		//

		if( 0  ||  0 ){
			// the sniff regex looks for a src attribute ending in dojo.js, optionally preceded with a path.
			// match[3] returns the path to dojo.js (if any) without the trailing slash. This is used for the
			// dojo location on CDN deployments and baseUrl when either/both of these are not provided
			// explicitly in the config data; this is the 1.6- behavior.

			var scripts = doc.getElementsByTagName("script"),
				i = 0,
				script, dojoDir, src, match;
			while(i < scripts.length){
				script = scripts[i++];
				if((src = script.getAttribute("src")) && (match = src.match(/(((.*)\/)|^)dojo\.js(\W|$)/i))){
					// sniff dojoDir and baseUrl
					dojoDir = match[3] || "";
					defaultConfig.baseUrl = defaultConfig.baseUrl || dojoDir;

					// remember an insertPointSibling
					insertPointSibling = script;
				}

				// sniff configuration on attribute in script element
				if((src = (script.getAttribute("data-dojo-config") || script.getAttribute("djConfig")))){
					dojoSniffConfig = req.eval("({ " + src + " })", "data-dojo-config");

					// remember an insertPointSibling
					insertPointSibling = script;
				}

				// sniff requirejs attribute
				if( 0 ){
					if((src = script.getAttribute("data-main"))){
						dojoSniffConfig.deps = dojoSniffConfig.deps || [src];
					}
				}
			}
		}

		if( 0 ){
			// pass down doh.testConfig from parent as if it were a data-dojo-config
			try{
				if(window.parent != window && window.parent.require){
					var doh = window.parent.require("doh");
					doh && mix(dojoSniffConfig, doh.testConfig);
				}
			}catch(e){}
		}

		// configure the loader; let the user override defaults
		req.rawConfig = {};
		config(defaultConfig, 1);

		// do this before setting userConfig/sniffConfig to allow userConfig/sniff overrides
		if( 0 ){
			packs.dojo.location = dojoDir;
			if(dojoDir){
				dojoDir += "/";
			}
			packs.dijit.location = dojoDir + "../dijit/";
			packs.dojox.location = dojoDir + "../dojox/";
		}

		config(userConfig, 1);
		config(dojoSniffConfig, 1);

	}else{
		// no config API, assume defaultConfig has everything the loader needs...for the entire lifetime of the application
		paths = defaultConfig.paths;
		pathsMapProg = defaultConfig.pathsMapProg;
		packs = defaultConfig.packs;
		aliases = defaultConfig.aliases;
		mapProgs = defaultConfig.mapProgs;
		modules = defaultConfig.modules;
		cache = defaultConfig.cache;
		cacheBust = defaultConfig.cacheBust;

		// remember the default config for other processes (e.g., dojo/config)
		req.rawConfig = defaultConfig;
	}


	if( 0 ){
		req.combo = req.combo || {add:noop};
		var	comboPending = 0,
			combosPending = [],
			comboPendingTimer = null;
	}


	// build the loader machinery iaw configuration, including has feature tests
	var	injectDependencies = function(module){
			// checkComplete!=0 holds the idle signal; we're not idle if we're injecting dependencies
			guardCheckComplete(function(){
				forEach(module.deps, injectModule);
				if( 0  && comboPending && !comboPendingTimer){
					comboPendingTimer = setTimeout(function() {
						comboPending = 0;
						comboPendingTimer = null;
						req.combo.done(function(mids, url) {
							var onLoadCallback= function(){
								// defQ is a vector of module definitions 1-to-1, onto mids
								runDefQ(0, mids);
								checkComplete();
							};
							combosPending.push(mids);
							injectingModule = mids;
							req.injectUrl(url, onLoadCallback, mids);
							injectingModule = 0;
						}, req);
					}, 0);
				}
			});
		},

		contextRequire = function(a1, a2, a3, referenceModule, contextRequire){
			var module, syntheticMid;
			if(isString(a1)){
				// signature is (moduleId)
				module = getModule(a1, referenceModule, true);
				if(module && module.executed){
					return module.result;
				}
				throw makeError("undefinedModule", a1);
			}
			if(!isArray(a1)){
				// a1 is a configuration
				config(a1, 0, referenceModule);

				// juggle args; (a2, a3) may be (dependencies, callback)
				a1 = a2;
				a2 = a3;
			}
			if(isArray(a1)){
				// signature is (requestList [,callback])
				if(!a1.length){
					a2 && a2();
				}else{
					syntheticMid = "require*" + uid();

					// resolve the request list with respect to the reference module
					for(var mid, deps = [], i = 0; i < a1.length;){
						mid = a1[i++];
						deps.push(getModule(mid, referenceModule));
					}

					// construct a synthetic module to control execution of the requestList, and, optionally, callback
					module = mix(makeModuleInfo("", syntheticMid, 0, ""), {
						injected: arrived,
						deps: deps,
						def: a2 || noop,
						require: referenceModule ? referenceModule.require : req,
						gc: 1 //garbage collect
					});
					modules[module.mid] = module;

					// checkComplete!=0 holds the idle signal; we're not idle if we're injecting dependencies
					injectDependencies(module);

					// try to immediately execute
					// if already traversing a factory tree, then strict causes circular dependency to abort the execution; maybe
					// it's possible to execute this require later after the current traversal completes and avoid the circular dependency.
					// ...but *always* insist on immediate in synch mode
					var strict = checkCompleteGuard && legacyMode!=sync;
					guardCheckComplete(function(){
						execModule(module, strict);
					});
					if(!module.executed){
						// some deps weren't on board or circular dependency detected and strict; therefore, push into the execQ
						execQ.push(module);
					}
					checkComplete();
				}
			}
			return contextRequire;
		},

		createRequire = function(module){
			if(!module){
				return req;
			}
			var result = module.require;
			if(!result){
				result = function(a1, a2, a3){
					return contextRequire(a1, a2, a3, module, result);
				};
				module.require = mix(result, req);
				result.module = module;
				result.toUrl = function(name){
					return toUrl(name, module);
				};
				result.toAbsMid = function(mid){
					return toAbsMid(mid, module);
				};
				if( 0 ){
					result.undef = function(mid){
						req.undef(mid, module);
					};
				}
				if( 0 ){
					result.syncLoadNls = function(mid){
						var nlsModuleInfo = getModuleInfo(mid, module),
							nlsModule = modules[nlsModuleInfo.mid];
						if(!nlsModule || !nlsModule.executed){
							cached = cache[nlsModuleInfo.mid] || cache[urlKeyPrefix + nlsModuleInfo.url];
							if(cached){
								evalModuleText(cached);
								nlsModule = modules[nlsModuleInfo.mid];
							}
						}
						return nlsModule && nlsModule.executed && nlsModule.result;
					};
				}

			}
			return result;
		},

		execQ =
			// The list of modules that need to be evaluated.
			[],

		defQ =
			// The queue of define arguments sent to loader.
			[],

		waiting =
			// The set of modules upon which the loader is waiting for definition to arrive
			{},

		setRequested = function(module){
			module.injected = requested;
			waiting[module.mid] = 1;
			if(module.url){
				waiting[module.url] = module.pack || 1;
			}
			startTimer();
		},

		setArrived = function(module){
			module.injected = arrived;
			delete waiting[module.mid];
			if(module.url){
				delete waiting[module.url];
			}
			if(isEmpty(waiting)){
				clearTimer();
				 0  && legacyMode==xd && (legacyMode = sync);
			}
		},

		execComplete = req.idle =
			// says the loader has completed (or not) its work
			function(){
				return !defQ.length && isEmpty(waiting) && !execQ.length && !checkCompleteGuard;
			},

		runMapProg = function(targetMid, map){
			// search for targetMid in map; return the map item if found; falsy otherwise
			if(map){
			for(var i = 0; i < map.length; i++){
				if(map[i][2].test(targetMid)){
					return map[i];
				}
			}
			}
			return 0;
		},

		compactPath = function(path){
			var result = [],
				segment, lastSegment;
			path = path.replace(/\\/g, '/').split('/');
			while(path.length){
				segment = path.shift();
				if(segment==".." && result.length && lastSegment!=".."){
					result.pop();
					lastSegment = result[result.length - 1];
				}else if(segment!="."){
					result.push(lastSegment= segment);
				} // else ignore "."
			}
			return result.join("/");
		},

		makeModuleInfo = function(pid, mid, pack, url){
			if( 0 ){
				var xd= req.isXdUrl(url);
				return {pid:pid, mid:mid, pack:pack, url:url, executed:0, def:0, isXd:xd, isAmd:!!(xd || (packs[pid] && packs[pid].isAmd))};
			}else{
				return {pid:pid, mid:mid, pack:pack, url:url, executed:0, def:0};
			}
		},

		getModuleInfo_ = function(mid, referenceModule, packs, modules, baseUrl, mapProgs, pathsMapProg, aliases, alwaysCreate){
			// arguments are passed instead of using lexical variables so that this function my be used independent of the loader (e.g., the builder)
			// alwaysCreate is useful in this case so that getModuleInfo never returns references to real modules owned by the loader
			var pid, pack, midInPackage, mapItem, url, result, isRelative, requestedMid;
			requestedMid = mid;
			isRelative = /^\./.test(mid);
			if(/(^\/)|(\:)|(\.js$)/.test(mid) || (isRelative && !referenceModule)){
				// absolute path or protocol of .js filetype, or relative path but no reference module and therefore relative to page
				// whatever it is, it's not a module but just a URL of some sort
				// note: pid===0 indicates the routine is returning an unmodified mid

				return makeModuleInfo(0, mid, 0, mid);
			}else{
				// relative module ids are relative to the referenceModule; get rid of any dots
				mid = compactPath(isRelative ? (referenceModule.mid + "/../" + mid) : mid);
				if(/^\./.test(mid)){
					throw makeError("irrationalPath", mid);
				}
				// at this point, mid is an absolute mid

				// map the mid
				if(referenceModule){
					mapItem = runMapProg(referenceModule.mid, mapProgs);
				}
				mapItem = mapItem || mapProgs.star;
				mapItem = mapItem && runMapProg(mid, mapItem[1]);

				if(mapItem){
					mid = mapItem[1] + mid.substring(mapItem[3]);
					}

				match = mid.match(/^([^\/]+)(\/(.+))?$/);
				pid = match ? match[1] : "";
				if((pack = packs[pid])){
					mid = pid + "/" + (midInPackage = (match[3] || pack.main));
				}else{
					pid = "";
				}

				// search aliases
				var candidateLength = 0,
					candidate = 0;
				forEach(aliases, function(pair){
					var match = mid.match(pair[0]);
					if(match && match.length>candidateLength){
						candidate = isFunction(pair[1]) ? mid.replace(pair[0], pair[1]) : pair[1];
					}
				});
				if(candidate){
					return getModuleInfo_(candidate, 0, packs, modules, baseUrl, mapProgs, pathsMapProg, aliases, alwaysCreate);
				}

				result = modules[mid];
				if(result){
					return alwaysCreate ? makeModuleInfo(result.pid, result.mid, result.pack, result.url) : modules[mid];
				}
			}
			// get here iff the sought-after module does not yet exist; therefore, we need to compute the URL given the
			// fully resolved (i.e., all relative indicators and package mapping resolved) module id

			// note: pid!==0 indicates the routine is returning a url that has .js appended unmodified mid
			mapItem = runMapProg(mid, pathsMapProg);
			if(mapItem){
				url = mapItem[1] + mid.substring(mapItem[3]);
			}else if(pid){
				url = pack.location + "/" + midInPackage;
			}else if( 0 ){
				url = "../" + mid;
			}else{
				url = mid;
			}
			// if result is not absolute, add baseUrl
			if(!(/(^\/)|(\:)/.test(url))){
				url = baseUrl + url;
			}
			url += ".js";
			return makeModuleInfo(pid, mid, pack, compactPath(url));
		},

		getModuleInfo = function(mid, referenceModule, fromPendingCache){
			return getModuleInfo_(mid, referenceModule, packs, modules, req.baseUrl, fromPendingCache ? [] : mapProgs, fromPendingCache ? [] : pathsMapProg, fromPendingCache ? [] : aliases);
		},

		resolvePluginResourceId = function(plugin, prid, referenceModule){
			return plugin.normalize ? plugin.normalize(prid, function(mid){return toAbsMid(mid, referenceModule);}) : toAbsMid(prid, referenceModule);
		},

		dynamicPluginUidGenerator = 0,

		getModule = function(mid, referenceModule, immediate){
			// compute and optionally construct (if necessary) the module implied by the mid with respect to referenceModule
			var match, plugin, prid, result;
			match = mid.match(/^(.+?)\!(.*)$/);
			if(match){
				// name was <plugin-module>!<plugin-resource-id>
				plugin = getModule(match[1], referenceModule, immediate);

				if( 0  && legacyMode == sync && !plugin.executed){
					injectModule(plugin);
					if(plugin.injected===arrived && !plugin.executed){
						guardCheckComplete(function(){
							execModule(plugin);
						});
					}
					if(plugin.executed){
						promoteModuleToPlugin(plugin);
					}else{
						// we are in xdomain mode for some reason
						execQ.unshift(plugin);
					}
				}



				if(plugin.executed === executed && !plugin.load){
					// executed the module not knowing it was a plugin
					promoteModuleToPlugin(plugin);
				}

				// if the plugin has not been loaded, then can't resolve the prid and  must assume this plugin is dynamic until we find out otherwise
				if(plugin.load){
					prid = resolvePluginResourceId(plugin, match[2], referenceModule);
					mid = (plugin.mid + "!" + (plugin.dynamic ? ++dynamicPluginUidGenerator + "!" : "") + prid);
				}else{
					prid = match[2];
					mid = plugin.mid + "!" + (++dynamicPluginUidGenerator) + "!waitingForPlugin";
				}
				result = {plugin:plugin, mid:mid, req:createRequire(referenceModule), prid:prid};
			}else{
				result = getModuleInfo(mid, referenceModule);
			}
			return modules[result.mid] || (!immediate && (modules[result.mid] = result));
		},

		toAbsMid = req.toAbsMid = function(mid, referenceModule){
			return getModuleInfo(mid, referenceModule).mid;
		},

		toUrl = req.toUrl = function(name, referenceModule){
			var moduleInfo = getModuleInfo(name+"/x", referenceModule),
				url= moduleInfo.url;
			return fixupUrl(moduleInfo.pid===0 ?
				// if pid===0, then name had a protocol or absolute path; either way, toUrl is the identify function in such cases
				name :
				// "/x.js" since getModuleInfo automatically appends ".js" and we appended "/x" to make name look like a module id
				url.substring(0, url.length-5)
			);
		},

		nonModuleProps = {
			injected: arrived,
			executed: executed,
			def: nonmodule,
			result: nonmodule
		},

		makeCjs = function(mid){
			return modules[mid] = mix({mid:mid}, nonModuleProps);
		},

		cjsRequireModule = makeCjs("require"),
		cjsExportsModule = makeCjs("exports"),
		cjsModuleModule = makeCjs("module"),

		runFactory = function(module, args){
			req.trace("loader-run-factory", [module.mid]);
			var factory = module.def,
				result;
			 0  && syncExecStack.unshift(module);
			if( 0 ){
				try{
					result= isFunction(factory) ? factory.apply(null, args) : factory;
				}catch(e){
					signal(error, module.result = makeError("factoryThrew", [module, e]));
				}
			}else{
				result= isFunction(factory) ? factory.apply(null, args) : factory;
			}
			module.result = result===undefined && module.cjs ? module.cjs.exports : result;
			 0  && syncExecStack.shift(module);
		},

		abortExec = {},

		defOrder = 0,

		promoteModuleToPlugin = function(pluginModule){
			var plugin = pluginModule.result;
			pluginModule.dynamic = plugin.dynamic;
			pluginModule.normalize = plugin.normalize;
			pluginModule.load = plugin.load;
			return pluginModule;
		},

		resolvePluginLoadQ = function(plugin){
			// plugins is a newly executed module that has a loadQ waiting to run

			// step 1: traverse the loadQ and fixup the mid and prid; remember the map from original mid to new mid
			// recall the original mid was created before the plugin was on board and therefore it was impossible to
			// compute the final mid; accordingly, prid may or may not change, but the mid will definitely change
			var map = {};
			forEach(plugin.loadQ, function(pseudoPluginResource){
				// manufacture and insert the real module in modules
				var prid = resolvePluginResourceId(plugin, pseudoPluginResource.prid, pseudoPluginResource.req.module),
					mid = plugin.dynamic ? pseudoPluginResource.mid.replace(/waitingForPlugin$/, prid) : (plugin.mid + "!" + prid),
					pluginResource = mix(mix({}, pseudoPluginResource), {mid:mid, prid:prid, injected:0});
				if(!modules[mid]){
					// create a new (the real) plugin resource and inject it normally now that the plugin is on board
					injectPlugin(modules[mid] = pluginResource);
				} // else this was a duplicate request for the same (plugin, rid) for a nondynamic plugin

				// pluginResource is really just a placeholder with the wrong mid (because we couldn't calculate it until the plugin was on board)
				// mark is as arrived and delete it from modules; the real module was requested above
				map[pseudoPluginResource.mid] = modules[mid];
				setArrived(pseudoPluginResource);
				delete modules[pseudoPluginResource.mid];
			});
			plugin.loadQ = 0;

			// step2: replace all references to any placeholder modules with real modules
			var substituteModules = function(module){
				for(var replacement, deps = module.deps || [], i = 0; i<deps.length; i++){
					replacement = map[deps[i].mid];
					if(replacement){
						deps[i] = replacement;
					}
				}
			};
			for(var p in modules){
				substituteModules(modules[p]);
			}
			forEach(execQ, substituteModules);
		},

		finishExec = function(module){
			req.trace("loader-finish-exec", [module.mid]);
			module.executed = executed;
			module.defOrder = defOrder++;
			 0  && forEach(module.provides, function(cb){ cb(); });
			if(module.loadQ){
				// the module was a plugin
				promoteModuleToPlugin(module);
				resolvePluginLoadQ(module);
			}
			// remove all occurrences of this module from the execQ
			for(i = 0; i < execQ.length;){
				if(execQ[i] === module){
					execQ.splice(i, 1);
				}else{
					i++;
				}
			}
			// delete references to synthetic modules
			if (/^require\*/.test(module.mid)) {
				delete modules[module.mid];
			}
		},

		circleTrace = [],

		execModule = function(module, strict){
			// run the dependency vector, then run the factory for module
			if(module.executed === executing){
				req.trace("loader-circular-dependency", [circleTrace.concat(module.mid).join("->")]);
				return (!module.def || strict) ? abortExec :  (module.cjs && module.cjs.exports);
			}
			// at this point the module is either not executed or fully executed


			if(!module.executed){
				if(!module.def){
					return abortExec;
				}
				var mid = module.mid,
					deps = module.deps || [],
					arg, argResult,
					args = [],
					i = 0;

				if( 0 ){
					circleTrace.push(mid);
					req.trace("loader-exec-module", ["exec", circleTrace.length, mid]);
				}

				// for circular dependencies, assume the first module encountered was executed OK
				// modules that circularly depend on a module that has not run its factory will get
				// the pre-made cjs.exports===module.result. They can take a reference to this object and/or
				// add properties to it. When the module finally runs its factory, the factory can
				// read/write/replace this object. Notice that so long as the object isn't replaced, any
				// reference taken earlier while walking the deps list is still valid.
				module.executed = executing;
				while((arg = deps[i++])){
					argResult = ((arg === cjsRequireModule) ? createRequire(module) :
									((arg === cjsExportsModule) ? module.cjs.exports :
										((arg === cjsModuleModule) ? module.cjs :
											execModule(arg, strict))));
					if(argResult === abortExec){
						module.executed = 0;
						req.trace("loader-exec-module", ["abort", mid]);
						 0  && circleTrace.pop();
						return abortExec;
					}
					args.push(argResult);
				}
				runFactory(module, args);
				finishExec(module);
				 0  && circleTrace.pop();
			}
			// at this point the module is guaranteed fully executed

			return module.result;
		},


		checkCompleteGuard = 0,

		guardCheckComplete = function(proc){
			try{
				checkCompleteGuard++;
				proc();
			}finally{
				checkCompleteGuard--;
			}
			if(execComplete()){
				signal("idle", []);
			}
		},

		checkComplete = function(){
			// keep going through the execQ as long as at least one factory is executed
			// plugins, recursion, cached modules all make for many execution path possibilities
			if(checkCompleteGuard){
				return;
			}
			guardCheckComplete(function(){
				checkDojoRequirePlugin();
				for(var currentDefOrder, module, i = 0; i < execQ.length;){
					currentDefOrder = defOrder;
					module = execQ[i];
					execModule(module);
					if(currentDefOrder!=defOrder){
						// defOrder was bumped one or more times indicating something was executed (note, this indicates
						// the execQ was modified, maybe a lot (for example a later module causes an earlier module to execute)
						checkDojoRequirePlugin();
						i = 0;
					}else{
						// nothing happened; check the next module in the exec queue
						i++;
					}
				}
			});
		};


	if( 0 ){
		req.undef = function(moduleId, referenceModule){
			// In order to reload a module, it must be undefined (this routine) and then re-requested.
			// This is useful for testing frameworks (at least).
			var module = getModule(moduleId, referenceModule);
			setArrived(module);
			mix(module, {def:0, executed:0, injected:0, node:0});
		};
	}

	if( 1 ){
		if( 1 ===undefined){
			 1 || has.add("dojo-loader-eval-hint-url", 1);
		}

		var fixupUrl= function(url){
				url += ""; // make sure url is a Javascript string (some paths may be a Java string)
				return url + (cacheBust ? ((/\?/.test(url) ? "&" : "?") + cacheBust) : "");
			},

			injectPlugin = function(
				module
			){
				// injects the plugin module given by module; may have to inject the plugin itself
				var plugin = module.plugin;

				if(plugin.executed === executed && !plugin.load){
					// executed the module not knowing it was a plugin
					promoteModuleToPlugin(plugin);
				}

				var onLoad = function(def){
						module.result = def;
						setArrived(module);
						finishExec(module);
						checkComplete();
					};

				if(plugin.load){
					plugin.load(module.prid, module.req, onLoad);
				}else if(plugin.loadQ){
					plugin.loadQ.push(module);
				}else{
					// the unshift instead of push is important: we don't want plugins to execute as
					// dependencies of some other module because this may cause circles when the plugin
					// loadQ is run; also, generally, we want plugins to run early since they may load
					// several other modules and therefore can potentially unblock many modules
					plugin.loadQ = [module];
					execQ.unshift(plugin);
					injectModule(plugin);
				}
			},

			// for IE, injecting a module may result in a recursive execution if the module is in the cache

			cached = 0,

			injectingModule = 0,

			injectingCachedModule = 0,

			evalModuleText = function(text, module){
				// see def() for the injectingCachedModule bracket; it simply causes a short, safe circuit
				if(has("config-stripStrict")){
					text = text.replace(/"use strict"/g, '');
				}
				injectingCachedModule = 1;
				if( 0 ){
					try{
						if(text===cached){
							cached.call(null);
						}else{
							req.eval(text,  1  ? module.url : module.mid);
						}
					}catch(e){
						signal(error, makeError("evalModuleThrew", module));
					}
				}else{
					if(text===cached){
						cached.call(null);
					}else{
						req.eval(text,  1  ? module.url : module.mid);
					}
				}
				injectingCachedModule = 0;
			},

			injectModule = function(module){
				// Inject the module. In the browser environment, this means appending a script element into
				// the document; in other environments, it means loading a file.
				//
				// If in synchronous mode, then get the module synchronously if it's not xdomainLoading.

				var mid = module.mid,
					url = module.url;
				if(module.executed || module.injected || waiting[mid] || (module.url && ((module.pack && waiting[module.url]===module.pack) || waiting[module.url]==1))){
					return;
				}
				setRequested(module);

				if( 0 ){
					var viaCombo = 0;
					if(module.plugin && module.plugin.isCombo){
						// a combo plugin; therefore, must be handled by combo service
						// the prid should have already been converted to a URL (if required by the plugin) during
						// the normalize process; in any event, there is no way for the loader to know how to
						// to the conversion; therefore the third argument is zero
						req.combo.add(module.plugin.mid, module.prid, 0, req);
						viaCombo = 1;
					}else if(!module.plugin){
						viaCombo = req.combo.add(0, module.mid, module.url, req);
					}
					if(viaCombo){
						comboPending= 1;
						return;
					}
				}

				if(module.plugin){
					injectPlugin(module);
					return;
				} // else a normal module (not a plugin)


				var onLoadCallback = function(){
					runDefQ(module);
					if(module.injected !== arrived){
						// the script that contained the module arrived and has been executed yet
						// nothing was added to the defQ (so it wasn't an AMD module) and the module
						// wasn't marked as arrived by dojo.provide (so it wasn't a v1.6- module);
						// therefore, it must not have been a module; adjust state accordingly
						if(has("dojo-enforceDefine")){
							signal(error, makeError("noDefine", module));
							return;
						}
						setArrived(module);
						mix(module, nonModuleProps);
						req.trace("loader-define-nonmodule", [module.url]);
					}

					if( 0  && legacyMode){
						// must call checkComplete even in for sync loader because we may be in xdomainLoading mode;
						// but, if xd loading, then don't call checkComplete until out of the current sync traversal
						// in order to preserve order of execution of the dojo.required modules
						!syncExecStack.length && checkComplete();
					}else{
						checkComplete();
					}
				};
				cached = cache[mid] || cache[urlKeyPrefix + module.url];
				if(cached){
					req.trace("loader-inject", ["cache", module.mid, url]);
					evalModuleText(cached, module);
					onLoadCallback();
					return;
				}
				if( 0  && legacyMode){
					if(module.isXd){
						// switch to async mode temporarily; if current legacyMode!=sync, then is must be one of {legacyAsync, xd, false}
						legacyMode==sync && (legacyMode = xd);
						// fall through and load via script injection
					}else if(module.isAmd && legacyMode!=sync){
						// fall through and load via script injection
					}else{
						// mode may be sync, xd/legacyAsync, or async; module may be AMD or legacy; but module is always located on the same domain
						var xhrCallback = function(text){
							if(legacyMode==sync){
								// the top of syncExecStack gives the current synchronously executing module; the loader needs
								// to know this if it has to switch to async loading in the middle of evaluating a legacy module
								// this happens when a modules dojo.require's a module that must be loaded async because it's xdomain
								// (using unshift/shift because there is no back() methods for Javascript arrays)
								syncExecStack.unshift(module);
								evalModuleText(text, module);
								syncExecStack.shift();

								// maybe the module was an AMD module
								runDefQ(module);

								// legacy modules never get to defineModule() => cjs and injected never set; also evaluation implies executing
								if(!module.cjs){
									setArrived(module);
									finishExec(module);
								}

								if(module.finish){
									// while synchronously evaluating this module, dojo.require was applied referencing a module
									// that had to be loaded async; therefore, the loader stopped answering all dojo.require
									// requests so they could be answered completely in the correct sequence; module.finish gives
									// the list of dojo.requires that must be re-applied once all target modules are available;
									// make a synthetic module to execute the dojo.require's in the correct order

									// compute a guaranteed-unique mid for the synthetic finish module; remember the finish vector; remove it from the reference module
									// TODO: can we just leave the module.finish...what's it hurting?
									var finishMid = mid + "*finish",
										finish = module.finish;
									delete module.finish;

									def(finishMid, ["dojo", ("dojo/require!" + finish.join(",")).replace(/\./g, "/")], function(dojo){
										forEach(finish, function(mid){ dojo.require(mid); });
									});
									// unshift, not push, which causes the current traversal to be reattempted from the top
									execQ.unshift(getModule(finishMid));
								}
								onLoadCallback();
							}else{
								text = transformToAmd(module, text);
								if(text){
									evalModuleText(text, module);
									onLoadCallback();
								}else{
									// if transformToAmd returned falsy, then the module was already AMD and it can be script-injected
									// do so to improve debugability(even though it means another download...which probably won't happen with a good browser cache)
									injectingModule = module;
									req.injectUrl(fixupUrl(url), onLoadCallback, module);
									injectingModule = 0;
								}
							}
						};

						req.trace("loader-inject", ["xhr", module.mid, url, legacyMode!=sync]);
						if( 0 ){
							try{
								req.getText(url, legacyMode!=sync, xhrCallback);
							}catch(e){
								signal(error, makeError("xhrInjectFailed", [module, e]));
							}
						}else{
							req.getText(url, legacyMode!=sync, xhrCallback);
						}
						return;
					}
				} // else async mode or fell through in xdomain loading mode; either way, load by script injection
				req.trace("loader-inject", ["script", module.mid, url]);
				injectingModule = module;
				req.injectUrl(fixupUrl(url), onLoadCallback, module);
				injectingModule = 0;
			},

			defineModule = function(module, deps, def){
				req.trace("loader-define-module", [module.mid, deps]);

				if( 0  && module.plugin && module.plugin.isCombo){
					// the module is a plugin resource loaded by the combo service
					// note: check for module.plugin should be enough since normal plugin resources should
					// not follow this path; module.plugin.isCombo is future-proofing belt and suspenders
					module.result = isFunction(def) ? def() : def;
					setArrived(module);
					finishExec(module);
					return module;
				}

				var mid = module.mid;
				if(module.injected === arrived){
					signal(error, makeError("multipleDefine", module));
					return module;
				}
				mix(module, {
					deps: deps,
					def: def,
					cjs: {
						id: module.mid,
						uri: module.url,
						exports: (module.result = {}),
						setExports: function(exports){
							module.cjs.exports = exports;
						},
						config:function(){
							return module.config;
						}
					}
				});

				// resolve deps with respect to this module
				for(var i = 0; deps[i]; i++){
					deps[i] = getModule(deps[i], module);
				}

				if( 0  && legacyMode && !waiting[mid]){
					// the module showed up without being asked for; it was probably in a <script> element
					injectDependencies(module);
					execQ.push(module);
					checkComplete();
				}
				setArrived(module);

				if(!isFunction(def) && !deps.length){
					module.result = def;
					finishExec(module);
				}

				return module;
			},

			runDefQ = function(referenceModule, mids){
				// defQ is an array of [id, dependencies, factory]
				// mids (if any) is a vector of mids given by a combo service
				var definedModules = [],
					module, args;
				while(defQ.length){
					args = defQ.shift();
					mids && (args[0]= mids.shift());
					// explicit define indicates possible multiple modules in a single file; delay injecting dependencies until defQ fully
					// processed since modules earlier in the queue depend on already-arrived modules that are later in the queue
					// TODO: what if no args[0] and no referenceModule
					module = (args[0] && getModule(args[0])) || referenceModule;
					definedModules.push([module, args[1], args[2]]);
				}
				consumePendingCacheInsert(referenceModule);
				forEach(definedModules, function(args){
					injectDependencies(defineModule.apply(null, args));
				});
			};
	}

	var timerId = 0,
		clearTimer = noop,
		startTimer = noop;
	if( 0 ){
		// Timer machinery that monitors how long the loader is waiting and signals an error when the timer runs out.
		clearTimer = function(){
			timerId && clearTimeout(timerId);
			timerId = 0;
		};

		startTimer = function(){
			clearTimer();
			if(req.waitms){
				timerId = window.setTimeout(function(){
					clearTimer();
					signal(error, makeError("timeout", waiting));
				}, req.waitms);
			}
		};
	}

	if ( 1 ) {
		// Test for IE's different way of signaling when scripts finish loading.  Note that according to
		// http://bugs.dojotoolkit.org/ticket/15096#comment:14, IE9 also needs to follow the
		// IE specific code path even though it has an addEventListener() method.
		// Unknown if special path needed on IE10+, which also has a document.attachEvent() method.
		// Should evaluate to false for Opera and Windows 8 apps, even though they document.attachEvent()
		//  is defined in both those environments.
		has.add("ie-event-behavior", doc.attachEvent && typeof Windows === "undefined" &&
			(typeof opera === "undefined" || opera.toString() != "[object Opera]"));
	}

	if( 1  && ( 1  ||  1 )){
		var domOn = function(node, eventName, ieEventName, handler){
				// Add an event listener to a DOM node using the API appropriate for the current browser;
				// return a function that will disconnect the listener.
				if(!has("ie-event-behavior")){
					node.addEventListener(eventName, handler, false);
					return function(){
						node.removeEventListener(eventName, handler, false);
					};
				}else{
					node.attachEvent(ieEventName, handler);
					return function(){
						node.detachEvent(ieEventName, handler);
					};
				}
			},
			windowOnLoadListener = domOn(window, "load", "onload", function(){
				req.pageLoaded = 1;
				doc.readyState!="complete" && (doc.readyState = "complete");
				windowOnLoadListener();
			});

		if( 1 ){
			// if the loader is on the page, there must be at least one script element
			// getting its parent and then doing insertBefore solves the "Operation Aborted"
			// error in IE from appending to a node that isn't properly closed; see
			// dojo/tests/_base/loader/requirejs/simple-badbase.html for an example
			// don't use scripts with type dojo/... since these may be removed; see #15809
			// prefer to use the insertPoint computed during the config sniff in case a script is removed; see #16958
			var scripts = doc.getElementsByTagName("script"),
				i = 0,
				script;
			while(!insertPointSibling){
				if(!/^dojo/.test((script = scripts[i++]) && script.type)){
					insertPointSibling= script;
				}
			}

			req.injectUrl = function(url, callback, owner){
				// insert a script element to the insert-point element with src=url;
				// apply callback upon detecting the script has loaded.

				var node = owner.node = doc.createElement("script"),
					onLoad = function(e){
						e = e || window.event;
						var node = e.target || e.srcElement;
						if(e.type === "load" || /complete|loaded/.test(node.readyState)){
							loadDisconnector();
							errorDisconnector();
							callback && callback();
						}
					},
					loadDisconnector = domOn(node, "load", "onreadystatechange", onLoad),
					errorDisconnector = domOn(node, "error", "onerror", function(e){
						loadDisconnector();
						errorDisconnector();
						signal(error, makeError("scriptError", [url, e]));
					});

				node.type = "text/javascript";
				node.charset = "utf-8";
				node.src = url;
				insertPointSibling.parentNode.insertBefore(node, insertPointSibling);
				return node;
			};
		}
	}

	if( 0 ){
		req.log = function(){
			try{
				for(var i = 0; i < arguments.length; i++){
					console.log(arguments[i]);
				}
			}catch(e){}
		};
	}else{
		req.log = noop;
	}

	if( 0 ){
		var trace = req.trace = function(
			group,	// the trace group to which this application belongs
			args	// the contents of the trace
		){
			///
			// Tracing interface by group.
			//
			// Sends the contents of args to the console iff (req.trace.on && req.trace[group])

			if(trace.on && trace.group[group]){
				signal("trace", [group, args]);
				for(var arg, dump = [], text= "trace:" + group + (args.length ? (":" + args[0]) : ""), i= 1; i<args.length;){
					arg = args[i++];
					if(isString(arg)){
						text += ", " + arg;
					}else{
						dump.push(arg);
					}
				}
				req.log(text);
				dump.length && dump.push(".");
				req.log.apply(req, dump);
			}
		};
		mix(trace, {
			on:1,
			group:{},
			set:function(group, value){
				if(isString(group)){
					trace.group[group]= value;
				}else{
					mix(trace.group, group);
				}
			}
		});
		trace.set(mix(mix(mix({}, defaultConfig.trace), userConfig.trace), dojoSniffConfig.trace));
		on("config", function(config){
			config.trace && trace.set(config.trace);
		});
	}else{
		req.trace = noop;
	}

	var def = function(
		mid,		  //(commonjs.moduleId, optional)
		dependencies, //(array of commonjs.moduleId, optional) list of modules to be loaded before running factory
		factory		  //(any)
	){
		///
		// Advises the loader of a module factory. //Implements http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition.
		///
		//note
		// CommonJS factory scan courtesy of http://requirejs.org

		var arity = arguments.length,
			defaultDeps = ["require", "exports", "module"],
			// the predominate signature...
			args = [0, mid, dependencies];
		if(arity==1){
			args = [0, (isFunction(mid) ? defaultDeps : []), mid];
		}else if(arity==2 && isString(mid)){
			args = [mid, (isFunction(dependencies) ? defaultDeps : []), dependencies];
		}else if(arity==3){
			args = [mid, dependencies, factory];
		}

		if( 0  && args[1]===defaultDeps){
			args[2].toString()
				.replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, "")
				.replace(/require\(["']([\w\!\-_\.\/]+)["']\)/g, function(match, dep){
				args[1].push(dep);
			});
		}

		req.trace("loader-define", args.slice(0, 2));
		var targetModule = args[0] && getModule(args[0]),
			module;
		if(targetModule && !waiting[targetModule.mid]){
			// given a mid that hasn't been requested; therefore, defined through means other than injecting
			// consequent to a require() or define() application; examples include defining modules on-the-fly
			// due to some code path or including a module in a script element. In any case,
			// there is no callback waiting to finish processing and nothing to trigger the defQ and the
			// dependencies are never requested; therefore, do it here.
			injectDependencies(defineModule(targetModule, args[1], args[2]));
		}else if(!has("ie-event-behavior") || ! 1  || injectingCachedModule){
			// not IE path: anonymous module and therefore must have been injected; therefore, onLoad will fire immediately
			// after script finishes being evaluated and the defQ can be run from that callback to detect the module id
			defQ.push(args);
		}else{
			// IE path: possibly anonymous module and therefore injected; therefore, cannot depend on 1-to-1,
			// in-order exec of onLoad with script eval (since it's IE) and must manually detect here
			targetModule = targetModule || injectingModule;
			if(!targetModule){
				for(mid in waiting){
					module = modules[mid];
					if(module && module.node && module.node.readyState === 'interactive'){
						targetModule = module;
						break;
					}
				}
				if( 0  && !targetModule){
					for(var i = 0; i<combosPending.length; i++){
						targetModule = combosPending[i];
						if(targetModule.node && targetModule.node.readyState === 'interactive'){
							break;
						}
						targetModule= 0;
					}
				}
			}
			if( 0  && isArray(targetModule)){
				injectDependencies(defineModule(getModule(targetModule.shift()), args[1], args[2]));
				if(!targetModule.length){
					combosPending.splice(i, 1);
				}
			}else if(targetModule){
				consumePendingCacheInsert(targetModule);
				injectDependencies(defineModule(targetModule, args[1], args[2]));
			}else{
				signal(error, makeError("ieDefineFailed", args[0]));
			}
			checkComplete();
		}
	};
	def.amd = {
		vendor:"dojotoolkit.org"
	};

	if( 0 ){
		req.def = def;
	}

	// allow config to override default implementation of named functions; this is useful for
	// non-browser environments, e.g., overriding injectUrl, getText, log, etc. in node.js, Rhino, etc.
	// also useful for testing and monkey patching loader
	mix(mix(req, defaultConfig.loaderPatch), userConfig.loaderPatch);

	// now that req is fully initialized and won't change, we can hook it up to the error signal
	on(error, function(arg){
		try{
			console.error(arg);
			if(arg instanceof Error){
				for(var p in arg){
					console.log(p + ":", arg[p]);
				}
				console.log(".");
			}
		}catch(e){}
	});

	// always publish these
	mix(req, {
		uid:uid,
		cache:cache,
		packs:packs
	});


	if( 0 ){
		mix(req, {
			// these may be interesting to look at when debugging
			paths:paths,
			aliases:aliases,
			modules:modules,
			legacyMode:legacyMode,
			execQ:execQ,
			defQ:defQ,
			waiting:waiting,

			// these are used for testing
			// TODO: move testing infrastructure to a different has feature
			packs:packs,
			mapProgs:mapProgs,
			pathsMapProg:pathsMapProg,
			listenerQueues:listenerQueues,

			// these are used by the builder (at least)
			computeMapProg:computeMapProg,
			computeAliases:computeAliases,
			runMapProg:runMapProg,
			compactPath:compactPath,
			getModuleInfo:getModuleInfo_
		});
	}

	// the loader can be defined exactly once; look for global define which is the symbol AMD loaders are
	// *required* to define (as opposed to require, which is optional)
	if(global.define){
		if( 0 ){
			signal(error, makeError("defineAlreadyDefined", 0));
		}
		return;
	}else{
		global.define = def;
		global.require = req;
		if( 0 ){
			require = req;
		}
	}

	if( 0  && req.combo && req.combo.plugins){
		var plugins = req.combo.plugins,
			pluginName;
		for(pluginName in plugins){
			mix(mix(getModule(pluginName), plugins[pluginName]), {isCombo:1, executed:"executed", load:1});
		}
	}

	if( 1 ){
		forEach(delayedModuleConfig, function(c){ config(c); });
		var bootDeps = dojoSniffConfig.deps ||	userConfig.deps || defaultConfig.deps,
			bootCallback = dojoSniffConfig.callback || userConfig.callback || defaultConfig.callback;
		req.boot = (bootDeps || bootCallback) ? [bootDeps || [], bootCallback] : 0;
	}
	if(! 1 ){
		!req.async && req(["dojo"]);
		req.boot && req.apply(null, req.boot);
	}
})
(this.dojoConfig || this.djConfig || this.require || {}, {
		async:1,
		hasCache:{
				'config-selectorEngine':"lite",
				'config-tlmSiblingOfDojo':1,
				'dojo-built':1,
				'dojo-loader':1,
				dom:1,
				'host-browser':1
		},
		packages:[
				{
					 location:".",
					 name:"dojo"
				},
				{
					 location:"../dijit",
					 name:"dijit"
				},
				{
					 location:"../core",
					 name:"core"
				},
				{
					 location:"../kitsonkelly-client",
					 name:"kitsonkelly-client"
				}
		]
});require({cache:{
'kitsonkelly-client/main':function(){
define([
	'core/dom', // dom.get, dom.query
	'core/on',
	'dojo/domReady!'
], function(dom, on) {

	var images = dom.query('.photos > a'),
		photoViewer = dom.get('photo-viewer'),
		photoViewerImg = photoViewer ? dom.query('#photo-viewer img')[0] : undefined;

	dom.query('#photo-viewer .close').on('click', function (e) {
		e && e.preventDefault();
		dom.modify(photoViewer, '.hidden');
	});

	if (photoViewer) {
		on(photoViewer, 'click', function (e) {
			e && e.preventDefault();
			dom.modify(photoViewer, '.hidden');
		});
	}

	if (images.length) {
		images.on('click', function (e) {
			e && e.preventDefault();
			photoViewerImg.src = e.target.src.replace('/thumb/', '/full/');
			dom.modify(photoViewer, '!.hidden');
		});
	}

});
},
'core/dom':function(){
define([
	'./doc',
	'./has',
	'./lang',
	'./on'
], function (doc, has, lang, on) {
	'use strict';

	has.add('dom-element-matches', function (global, doc, element) {
		// This is slightly more robust than what is in dojo/selector/lite in that it returns the function name out of
		// the prototype, which can then be used as a key on Elements directly.

		// Also, currently the has API doesn't recognise the pseudo DOM and therefore the passed arguments to the
		// function to detect the capabilities
		var matchesFunctionName = 'matches' in element ? 'matches' : false;
		if (!matchesFunctionName) {
			['moz', 'webkit', 'ms', 'o'].some(function (vendorPrefix) {
				return vendorPrefix + 'MatchesSelector' in element ?
					matchesFunctionName = vendorPrefix + 'MatchesSelector' : false;
			});
		}
		return matchesFunctionName;
	});

	has.add('css-user-select', function (global, doc, element) {
		if (!element) {
			return false;
		}

		var style = element.style,
			prefixes = ['Khtml', 'O', 'ms', 'Moz', 'Webkit'],
			i = prefixes.length,
			name = 'userSelect';

		do {
			if (typeof style[name] !== 'undefined') {
				return name;
			}
		}
		while (i-- && (name = prefixes[i] + 'UserSelect'));

		return false;
	});

	var defineProperties = Object.defineProperties,
		defineProperty = Object.defineProperty;

	// if it has any of these combinators, it is probably going to be faster with a document fragment
	var fragmentFasterHeuristicRE = /[-+,> ]/,

		selectorRE = /(?:\s*([-+ ,<>]))?\s*(\.|!\.?|#)?([-\w%$|]+)?(?:\[([^\]=]+)=?['"]?([^\]'"]*)['"]?\])?/g,
		selectorParserRE = /(?:\s*([-+ ,<>]))?\s*(\.|!\.?|#)?([-\w%$|]+)?(?:\[([^\]=]+)=?['"]?([^\]'"]*)['"]?\])?(?::([-\w]+)(?:\(([^\)]+)\))?)?/g,
		namespaces = false,
		namespaceIndex,

		// This matches query selectors that are faster to handle via other methods than qSA
		fastPathRE = /^([\w]*)#([\w\-]+$)|^(\.)([\w\-\*]+$)|^(\w+$)/,

		// Used to split union selectors into separate entities
		unionSplitRE = /([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g;

	function insertTextNode(doc, node, text) {
		node.appendChild(doc.createTextNode(text));
	}

	function get(id) {
		return ((typeof id === 'string') ? this.doc.getElementById(id) : id) || null;
	}

	function getSelectorObject(selector) {
		var combinator,
			tag,
			id,
			classes = [],
			pseudoSelectors = {},
			attributes = {};

		function parser(t, comb, prefix, value, attrName, attrValue, pseudoName, pseudoValue) {
			if (comb) {
				combinator = comb;
			}
			if (prefix) {
				if (prefix === '#') {
					id = value;
				}
				else {
					classes.push(value);
				}
			}
			else if (value) {
				tag = value;
			}
			if (attrName) {
				attributes[attrName] = attrValue;
			}
			if (pseudoName) {
				pseudoSelectors[pseudoName] = pseudoValue || true;
			}
		}

		selector.replace(selectorParserRE, parser);

		return {
			combinator: combinator,
			tag: tag,
			id: id,
			classes: classes,
			pseudoSelectors: pseudoSelectors,
			attributes: attributes
		};
	}

	function add(node/*, selectors...*/) {
		var args = arguments,
			// use the first argument as the default return value in case only a DOM Node is passed in
			returnValue = node,
			argument;

		var thisDoc = this.doc,
			fragment,
			referenceNode,
			currentNode,
			nextSibling,
			lastSelectorArg,
			leftoverCharacters;

		function insertLastNode() {
			if (currentNode && referenceNode && currentNode !== referenceNode) {
				(referenceNode === node &&
					(fragment ||
						(fragment = fragmentFasterHeuristicRE.test(argument) && thisDoc.createDocumentFragment()))
						|| referenceNode).insertBefore(currentNode, nextSibling || null);
			}
		}

		function parseSelector(t, combinator, prefix, value, attrName, attrValue) {
			var currentNodeClassName,
				removed,
				method;

			if (combinator) {
				insertLastNode();
				if (combinator === '-' || combinator === '+') {
					// TODO: add support for a >- as a means of indicating before the next child?
					referenceNode = (nextSibling = (currentNode || referenceNode)).parentNode;
					currentNode = null;
					if (combinator === '+') {
						nextSibling = nextSibling.nextSibling;
					}
					// else a - operator, again not in CSS, but obvious in it's meaning (create next element before
					// the currentNode/referenceNode)
				}
				else {
					if (combinator === '<') {
						referenceNode = currentNode = (currentNode || referenceNode).parentNode;
					}
					else {
						if (combinator === ',') {
							referenceNode = node;
						}
						else if (currentNode) {
							referenceNode = currentNode;
						}
						currentNode = null;
					}
					nextSibling = 0;
				}
				if (currentNode) {
					referenceNode = currentNode;
				}
			}
			var tag = !prefix && value;
			if (tag || (!currentNode && (prefix || attrName))) {
				if (tag === '$') {
					insertTextNode(thisDoc, referenceNode, args[++i]);
				}
				else {
					tag = tag || dom.defaultTag;
					currentNode = namespaces && ~(namespaceIndex = tag.indexOf('|')) ?
						thisDoc.createElementNS(namespaces[tag.slice(0, namespaceIndex)], tag.slice(namespaceIndex + 1)) :
						thisDoc.createElement(tag);
				}
			}
			if (prefix) {
				if (value === '$') {
					value = args[++i];
				}
				if (prefix === '#') {
					currentNode.id = value;
				}
				else {
					currentNodeClassName = currentNode.className;
					removed = currentNodeClassName && (' ' + currentNodeClassName + ' ').replace(' ' + value + ' ', ' ');
					if (prefix === '.') {
						currentNode.className = currentNodeClassName ? (removed + value).substring(1) : value;
					}
					else {
						if (argument === '!') {
							currentNode.parentNode.removeChild(currentNode);
						}
						else {
							removed = removed.substring(1, removed.length - 1);
							if (removed !== currentNodeClassName) {
								currentNode.className = removed;
							}
						}
					}
				}
			}
			if (attrName) {
				if (attrValue === '$') {
					attrValue = args[++i];
				}
				if (attrName === 'style') {
					currentNode.style.cssText = attrValue;
				}
				if (attrName === 'content' || attrName === '!content') {
					while (currentNode.firstChild !== null) {
						currentNode.removeChild(currentNode.firstChild);
					}
					if (attrName === 'content') {
						currentNode.appendChild(doc.createTextNode(attrValue));
					}
				}
				else {
					method = attrName.charAt(0) === '!' ? (attrName = attrName.substring(1)) && 'removeAttribute'
						: 'setAttribute';
					attrValue = attrValue === '' ? attrName : attrValue;
					namespaces && ~(namespaceIndex = attrName.indexOf('|')) ?
						currentNode[method + 'NS'](namespaces[attrName.slice(0, namespaceIndex)],
							attrName.slice(namespaceIndex + 1), attrValue) :
						currentNode[method](attrName, attrValue);
				}
			}
			return '';
		}

		var i = 0,
			key;
		for (; i < args.length; i++) {
			argument = args[i];
			if (typeof argument === 'object') {
				lastSelectorArg = false;
				if (argument instanceof Array) {
					// an Array
					currentNode = thisDoc.createDocumentFragment();
					var self = this;
					argument.forEach(function (item) {
						currentNode.appendChild(add.call(self, item));
					});
					argument = currentNode;
				}
				if (argument.nodeType) {
					currentNode = argument;
					insertLastNode();
					referenceNode = argument;
					nextSibling = 0;
				}
				else {
					// an object hash
					for (key in argument) {
						currentNode[key] = argument[key];
					}
				}
			}
			else if (lastSelectorArg) {
				lastSelectorArg = false;
				insertTextNode(thisDoc, currentNode, argument);
			}
			else {
				if (i < 1) {
					node = null;
				}
				lastSelectorArg = true;
				leftoverCharacters = argument.replace(selectorRE, parseSelector);
				if (leftoverCharacters) {
					throw new SyntaxError('Unexpected char "' + leftoverCharacters + '" in "' + argument + '"');
				}
				insertLastNode();
				referenceNode = returnValue = currentNode || referenceNode;
			}
		}
		if (node && fragment) {
			node.appendChild(fragment);
		}
		return returnValue;
	}

	function modify(node /*, selectors...*/) {
		return node;
	}

	function query(/*selectors...*/) {
		var args = arguments,
			argument,
			results = [],
			node = this.doc,
			thisDoc = this.doc,
			self = this,
			fastPath,
			fastPathResults,
			i;

		function rootQuerySelectorAll(root, selector) {
			var origRoot = root,
				rQSA = root.querySelectorAll,
				oldId = root.getAttribute('id'),
				newId = oldId || '__dojo__',
				hasParent = root.parentNode,
				relativeHierarchySelector = /^\s*[+~]/.test(selector),
				selectors,
				i = 0;

			if (relativeHierarchySelector && !hasParent) {
				// This is a "bad" query that simply won't return anything, so why even try
				return [];
			}
			if (!oldId) {
				// If the node doesn't have an ID, let's give it one
				root.setAttribute('id', newId);
			}
			else {
				newId = newId.replace(/'/g, '\\$&');
			}
			if (relativeHierarchySelector && hasParent) {
				root = root.parentNode;
			}
			selectors = selector.match(unionSplitRE);
			for (; i < selectors.length; i++) {
				selectors[i] = '[id=\'' + newId + '\'] ' + selectors[i];
			}
			selector = selectors.join(',');

			try {
				return Array.prototype.slice.call(rQSA.call(root, selector));
			}
			finally {
				if (!oldId) {
					origRoot.removeAttribute('id');
				}
			}
		}

		function fastPathQuery(root, selectorMatch) {
			var parent,
				found;

			if (selectorMatch[2]) {
				// Looks like we are selecting and ID
				found = get.call(self, selectorMatch[2]);
				if (!found || (selectorMatch[1] && selectorMatch[1] !== found.tagName.toLowerCase())) {
					// Either ID wasn't found or there was a tag qualified it didn't match
					return [];
				}
				if (root !== thisDoc) {
					// There is a root element, let's make sure it is in the ancestry try
					parent = found;
					while (parent !== node) {
						parent = parent.parentNode;
						if (!parent) {
							// Ooops, silly person tried selecting an ID that isn't a descendent of the root node
							return [];
						}
					}
				}
				// if there is part of the selector that hasn't been resolved, then we have to pass it back to
				// query to further resolve, otherwise we append it to the results
				return selectorMatch[3] ? query(found, selectorMatch[3]) : [ found ];
			}
			if (selectorMatch[3] && root.getElementsByClassName) {
				// a .class selector
				return Array.prototype.slice.call(root.getElementsByClassName(selectorMatch[4]));
			}
			if (selectorMatch[5]) {
				// a tag
				return Array.prototype.slice.call(root.getElementsByTagName(selectorMatch[5]));
			}
		}

		for (i = 0; i < args.length; i++) {
			argument = args[i];
			if ((typeof argument === 'object' && argument && argument.nodeType) || !argument) {
				// this argument is a node and is now the subject of subsequent selectors
				node = argument;
				continue;
			}
			if (!node) {
				// There is no subject node at the moment, continue consuming arguments
				continue;
			}
			if (typeof argument === 'string') {
				// It is assumed all strings are selectors
				fastPath = fastPathRE.exec(argument);
				if (fastPath) {
					// Quicker to not use qSA
					fastPathResults = fastPathQuery(node, fastPath);
				}
				if (fastPathResults) {
					// There were results returned from fastPathQuery
					results = results.concat(fastPathResults);
				}
				else {
					// qSA should be faster
					if (node === thisDoc) {
						// This is a non-rooted query, just use qSA
						results = results.concat(Array.prototype.slice.call(node.querySelectorAll(argument)));
					}
					else {
						// This is a rooted query, and qSA is really strange in its behaviour, in that it will return
						// nodes that match the selector, irrespective of the context of the root node
						results = results.concat(rootQuerySelectorAll(node, argument));
					}
				}
			}
			else if (argument) {
				throw new TypeError('Invalid argument type of: "' + typeof argument + '"');
			}
		}

		return decorate.call(this, results);
	}

	function remove(node) {
		var parentNode;
		if ((parentNode = node.parentNode)) {
			parentNode.removeChild(node);
		}
	}

	var nodeListDescriptors = {
		on: {
			value: function (type, listener) {
				var handles = this.map(function (node) {
					return on(node, type, listener);
				});
				handles.remove = function () {
					handles.forEach(function (handle) {
						handle.remove();
					});
				};
				return handles;
			},
			configurable: true
		},
		add: {
			value: function (/* selectors... */) {
				var self = this,
					args = Array.prototype.slice.call(arguments);
				return decorate.call(self, self.map(function (node) {
					return add.apply(self, [ node ].concat(args));
				}));
			},
			configurable: true
		},
		modify: {
			value: function (/* selectors... */) {
				var self = this,
					args = Array.prototype.slice.call(arguments);
				return self.map(function (node) {
					return modify.apply(self, [ node ].concat(args));
				});
			},
			configurable: true
		},
		remove: {
			value: function () {
				this.forEach(function (node) {
					remove(node);
				});
			},
			configurable: true
		}
	};

	function decorate(nodes) {
		if (!nodes) {
			return nodes;
		}
		defineProperties(nodes, nodeListDescriptors);
		if (this && this.doc) {
			defineProperty(nodes, 'doc', {
				value: this.doc,
				configurable: true
			});
		}
		return nodes;
	}

	// This all probably needs to be moved somewhere else, but it exists in dojo/dom and doesn't have another home at
	// the moment.
	var cssUserSelect = has('css-user-select');

	var setSelectable = cssUserSelect ? function (node, selectable) {
		// css-user-select returns a (possibly vendor-prefixed) CSS property name
		get(node).style[cssUserSelect] = selectable ? '' : 'none';
	} : function (node, selectable) {
		node = get(node);

		var nodes = node.getElementsByTagName('*'),
			i = nodes.length;

		// (IE < 10 / Opera) Fall back to setting/removing the unselectable attribute on the element and all its
		// children
		if (selectable) {
			node.removeAttribute('unselectable');
			while (i--) {
				nodes[i].removeAttribute('unselectable');
			}
		}
		else {
			node.setAttribute('unselectable', 'on');
			while (i--) {
				nodes[i].setAttribute('unselectable', 'on');
			}
		}
	};

	var descriptors = {
		get: {
			value: get,
			enumerable: true
		},
		add: {
			value: add,
			enumerable: true
		},
		modify: {
			// TODO: Complete modify!!!
			value: add,
			enumerable: true
		},
		query: {
			value: query,
			enumerable: true
		},
		remove: {
			value: remove,
			enumerable: true
		},
		parseSelector: {
			value: getSelectorObject,
			enumerable: true
		},
		setSelectable: {
			value: setSelectable,
			enumerable: true
		},
		defaultTag: {
			value: 'div',
			writable: true,
			enumerable: true
		},
		addNamespace: {
			value: function (name, uri) {
				(namespaces || (namespaces = {}))[name] = uri;
			},
			enumerable: true
		},
		nodeListDescriptors: {
			value: nodeListDescriptors,
			enumerable: true
		},
		doc: {
			value: doc,
			writable: true,
			enumerable: true
		}
	};

	var proto = Object.create(Object.prototype, descriptors);

	var domCache = [];

	function Dom(doc) {
		this.doc = doc;
	}

	proto.constructor = Dom;

	Dom.prototype = proto;

	var dom = function (doc) {
		var d;
		if (domCache.some(function (item) {
			if (item.doc === doc) {
				/* jshint boss:true */
				return d = item.dom;
			}
		})) {
			return d;
		}
		else {
			d = new Dom(doc);
			domCache.push({
				doc: doc,
				dom: d
			});
			return new Dom(doc);
		}
	};

	defineProperties(dom, descriptors);
	dom.prototype = proto;

	domCache.push({
		doc: doc,
		dom: dom
	});

	return dom;
});
},
'core/doc':function(){
define([
	'./compose',
	'./has'
], function (compose, has) {
	'use strict';

	if ( 1 ) {
		return document;
	}
	else {
		var emptyElements = {};
		[
			'base',
			'link',
			'meta',
			'hr',
			'br',
			'wbr',
			'img',
			'embed',
			'param',
			'source',
			'track',
			'area',
			'col',
			'input',
			'keygen',
			'command'
		].forEach(function (tag) {
			emptyElements[tag] = true;
		});

		var currentIndentation = '';

		var property = compose.property;

		var body;

		var Element = compose(function (tag) {
			this.tag = tag;
		}, {
			nodeType: 1,
			toString: function (noClose) {
				var tag = this.tag,
					emptyElement = emptyElements[tag];
				if (doc.indentation && !noClose) {
					// using pretty printing for indentation
					var lastIndentation = currentIndentation;
					currentIndentation += doc.indentation;
					var html = (tag === 'html' ? '<!DOCTYPE html>\n<html' : '\n' + lastIndentation + '<' + tag) +
						(this.attributes ? ' class="' + this.className + '"' : '') + '>' +
						(this.children ? this.children.join('') : '') +
						(!this.mixed && !emptyElement && this.children ? '\n' + lastIndentation : '') +
						(emptyElement ? '' : ('</' + tag + '>'));

					currentIndentation = lastIndentation;
					return html;
				}
				return (this.tag === 'html' ? '<!DOCTYPE html>\n<html' : '<' + this.tag) +
					(this.attributes ? this.attributes.join('') : '') +
					(this.className ? ' class="' + this.className + '"' : '') + '>' +
					(this.children ? this.children.join('') : '') +
					((noClose || emptyElement) ? '' : ('</' + tag + '>'));
			},
			sendTo: function (stream) {
				if (typeof stream === 'function') {
					stream = {
						write: stream,
						end: stream
					};
				}
				var active = this,
					streamIndentation = '';

				function pipe(element) {
					// TODO: Perhaps consider buffering if it is any faster and having a non-indentation version that is faster
					var closing = returnTo(this);
					if (closing) {
						stream.write(closing);
					}
					if (element.tag) {
						if (doc.indentation) {
							stream.write('\n' + streamIndentation + element.toString(true));
							streamIndentation += doc.indentation;
						}
						else {
							stream.write(element.toString(true));
						}
						this.children = true;
						active = element;
						element.pipe = pipe;
					}
					else {
						stream.write(element.toString());
					}
				}

				function returnTo(element) {
					var output = '';
					while (active !== element) {
						if (!active) {
							throw new Error('Can not add to an element that has already been streamed.');
						}
						var tag = active.tag,
							emptyElement = emptyElement[tag];

						if (doc.indentation) {
							streamIndentation = streamIndentation.slice(doc.indentation.length);
							if (!emptyElement) {
								output += ((active.mixed || !active.children) ? '' : '\n' + streamIndentation) +
									'</' + tag + '>';
							}
						}
						else if (!emptyElement) {
							output += '</' + tag + '>';
						}
						active = active.parentNode;
					}
					return output;
				}

				pipe.call(this, this);
				// add on end() to close all the tags and close the stream
				this.end = function (leaveStreamOpen) {
					stream[leaveStreamOpen ? 'write' : 'end'](returnTo(this) + '\n</' + this.tag + '>');
				};
				return this;
			},
			firstChild: property({
				get: function () {
					return this.children && this.children.length ? this.children[0] : null;
				},
				enumerable: true
			}),
			children: false,
			attributes: false,
			insertBefore: function (child, reference) {
				child.parentNode = this;
				if (this.pipe) {
					return this.pipe(child);
				}
				var children = this.children;
				if (!children) {
					children = this.children = [];
				}
				if (reference) {
					for (var i = 0; i < children.length; i++) {
						if (reference === children[i]) {
							child.nextSibling = reference;
							if (i > 0) {
								children[i - 1].nextSibling = child;
							}
							return children.splice(i, 0, child);
						}
					}
				}
				if (children.length > 0) {
					children[children.length - 1].nextSibling = child;
				}
				children.push(child);
			},
			appendChild: function (child) {
				if (typeof child === 'string') {
					this.mixed = true;
				}
				if (this.pipe) {
					return this.pipe(child);
				}
				var children = this.children;
				if (!children) {
					children = this.children = [];
				}
				children.push(child);
			},
			removeChild: function (child) {
				if (this.children && this.children.length) {
					var idx = this.children.indexOf(child);
					if (~idx) {
						return this.children.splice(idx, 1);
					}
				}
				throw new Error('Not a child of node.');
			},
			setAttribute: function (name, value/*, escape*/) {
				var attributes = this.attributes || (this.attributes = []);
				attributes.push(' ' + name + '="' + value + '"');
			},
			removeAttribute: function (name) {
				var attributes = this.attributes;
				if (!attributes) {
					return;
				}
				var match = ' ' + name + '=',
					matchLength = match.length;
				for (var i = 0; i < attributes.length; i++) {
					if (attributes[i].slice(0, matchLength) === match) {
						return attributes.splice(i, 1);
					}
				}
			},
			querySelectorAll: function (selector) {
				// TODO
			},
			matches: function (selector) {
				// TODO
			},
			innerHTML: property({
				get: function () {
					return this.children.join('');
				},
				set: function (value) {
					this.mixed = true;
					if (this.pipe) {
						return this.pipe(value);
					}
					this.children = [value];
				}
			})
		});

		var DocumentFragment = compose(Element, {
			toString: function () {
				return this.children ? this.children.join('') : '';
			}
		});

		var lessThanRE = /</g,
			ampersandRE = /&/g,
			namespacePrefixes = {};

		var doc = Object.create(Object.prototype, {
			createElement: {
				value: function (tag) {
					return new Element(tag);
				},
				enumerable: true
			},
			createElementNS: {
				value: function (uri, tag) {
					return new Element(namespacePrefixes[uri] + ':' + tag);
				},
				enumerable: true
			},
			createTextNode: {
				value: function (value) {
					return (typeof value === 'string' ? value : ('' + value)).replace(lessThanRE, '&lt;')
						.replace(ampersandRE, '&amp;');
				},
				enumerable: true
			},
			createDocumentFragment: {
				value: function () {
					return new DocumentFragment();
				},
				enumerable: true
			},
			getElementById: {
				value: function (id) {
					// TODO
				},
				enumerable: true
			},
			querySelectorAll: {
				value: function (selector) {
					// TODO
				},
				enumerable: true
			},
			body: {
				get: function () {
					if (!body) {
						body = new Element('body');
					}
					return body;
				},
				enumerable: true
			},
			indentation: {
				value: '    ',
				writable: true
			}
		});

		return doc;
	}
});
},
'core/compose':function(){
define([
	'./lang', // lang.delegate
	'./properties'
], function (lang, properties) {
	'use strict';

	function isInMethodChain(method, name, prototypes) {
		// summary:
		//		Searches for a method in the given prototype hierarchy
		// returns: Boolean

		return prototypes.some(function (prototype) {
			return prototype[name] === method;
		});
	}

	function getBases(args, prototypeFlag) {
		// summary:
		//		Registers a set of constructors for a class, eliminating duplicate constructors that may result from
		//		diamond construction for classes (e.g. B->A, C->A, D->B&C, then D() should only call A() once)
		// args: Array
		//		An array of constructors to utilise to return
		// prototypeFlag: Boolean
		//		Used to identify if the bases being collected are for the construction of a prototype.
		// returns: Array
		//		An array of constructors for a class

		var bases = [];

		function iterate(args, checkChildren) {
			outer:
			for (var i = 0; i < args.length; i++) {
				var arg = args[i],
					target = prototypeFlag && typeof arg === 'function' ? arg.prototype : arg;
				if (prototypeFlag || typeof arg === 'function') {
					var argGetBases = checkChildren && arg._getBases;
					if (argGetBases) {
						iterate(argGetBases(prototypeFlag));	// don't need to check children for these, they should
																// be pre-flattened
					}
					else {
						for (var j = 0; j < bases.length; j++) {
							if (target === bases[j]) {
								continue outer;
							}
						}
						bases.push(target);
					}
				}
			}
		}

		iterate(args, true);
		return bases;
	}

	function validArg(/* Mixed */ arg) {
		// summary:
		//		Checks to see if a valid argument is being passed and throws an error if it isn't, otherwise returns
		//		the argument

		if (!arg) {
			throw new Error('compose arguments must be functions or objects');
		}
		return arg; // Mixed
	}

	function required() {
		// summary:
		//		A "stub" function used to identify properties that are required in descendent objects.  Throws an
		//		error if called without the property being implemented.

		throw new Error('This method is required and no implementation has been provided');
	}

	function extend() {
		// summary:
		//		A shortcut function to quickly extend an Object via compose

		var args = [this];
		args.push.apply(args, arguments);
		return compose.apply(0, args);
	}

	function mixin(dest, sources) {
		// summary:
		//		A specialised mixin function that handles hierarchial prototypes
		// dest: Object|Function
		//		The base of which the `sources` will be mixed into
		// sources: Array
		//		The source (or sources) that should be mixed into the Object from left to right.
		// returns: Object
		//		The composite of the sources mixed in

		function set(dest, key, value, propertyDescriptor) {
			// summary:
			//		Either sets a value to a property if the property already exists in the target, otherwise defines
			//		a new property using the supplied property descriptor.

			if (key in dest && dest.hasOwnProperty(key)) {
				dest[key] = value;
			}
			else {
				Object.defineProperty(dest, key, propertyDescriptor);
			}
		}

		function mixinPrototype(dest, proto) {
			// summary:
			//		Take a prototype and mix it into a destination, looking for specifically decorated values

			var key, value, own, propertyDescriptor;
			for (key in proto) {
				propertyDescriptor = properties.getDescriptor(proto, key);
				value = proto[key];
				own = proto.hasOwnProperty(key);
				if (typeof value === 'function' && key in dest && value !== dest[key]) {
					if (value === required) {
						// this is a required value, which is now supplied, so fulfilled
						propertyDescriptor = properties.getDescriptor(dest, key);
						value = dest[key];
					}
					else if (!own) {
						if (isInMethodChain(value, key,
								getBases(Array.prototype.slice.call(sources, 0, i + 1), true))) {
							// this value is in the existing method's override chain, we can use the existing method
							propertyDescriptor = properties.getDescriptor(dest, key);
							value = dest[key];
						}
						else if (!isInMethodChain(dest[key], key, getBases([ proto ], true))) {
							// The existing method is in the current override chain, so we are left with a conflict
							console.error('Conflicted method ' + key + ', final composer must explicitly override' +
									'with correct method.');
						}
					}
				}
				if (value && value.install && own && !isInMethodChain(dest[key], key, getBases([ proto ], true))) {
					// apply decorator
					value.install.call(dest, key);
				}
				else {
					set(dest, key, value, propertyDescriptor);
				}
			}
		}

		function mixinObject(dest, obj) {
			// summary:
			//		Take an object and mix it into a destination, looking for specifically decorated values

			var key, value, propertyDescriptor;
			for (key in obj) {
				propertyDescriptor = properties.getDescriptor(obj, key);
				value = obj[key];
				if (typeof value === 'function') {
					if (value.install) {
						// apply decorator
						value.install.call(dest, key);
						continue;
					}
					if (key in dest) {
						if (value === required) {
							// requirement met
							continue;
						}
					}
				}
				set(dest, key, value, propertyDescriptor);
			}
		}

		var i, arg;

		for (i = 0; i < sources.length; i++) {
			arg = sources[i];
			if (typeof arg === 'function') {
				mixinPrototype(dest, arg.prototype);
			}
			else {
				mixinObject(dest, validArg(arg));
			}
		}
		return dest;
	}

	function compose(base /*=====, extensions =====*/) {
		// summary:
		//		Object compositor for JavaScript, featuring JavaScript-style prototype inheritance and composition,
		//		multiple inheritance, mixin and traits-inspired conflict resolution and composition.
		// base: Object|Function
		//		The object or constructor function that is used for the base to be composited upon
		// extensions: Object|Function...
		//		Additional constructor functions or objects to be composited into the base
		// returns: Object
		//		The composited object class, which can be instantiated with `new`

		var args = arguments,
			proto = (args.length < 2 && typeof args[0] !== 'function') ? args[0] :
				mixin(lang.delegate(validArg(base)), Array.prototype.slice.call(arguments, 1));

		var constructors = getBases(args),
			constructorsLength = constructors.length;

		if (typeof args[args.length - 1] === 'object') {
			args[args.length - 1] = proto;
		}

		var prototypes = getBases(args, true);

		function Constructor() {
			// summary:
			//		The base constructor function for compose generated classes.  Will return a new instance, even if
			//		called directly, without the `new` keyword.
			// returns: Object
			//		The constructed object

			var instance = this instanceof Constructor ? this : Object.create(proto);
			for (var i = 0; i < constructorsLength; i++) {
				var constructor = constructors[i],
					result = constructor.apply(instance, arguments);
				if (typeof result === 'object') {
					if (result instanceof Constructor) {
						instance = result;
					}
					else {
						Object.keys(result).forEach(function (key) {
							if (key in instance) {
								instance[key] = result[key];
							}
							else {
								Object.defineProperty(instance, key, Object.getOwnPropertyDescriptor(result, key));
							}
						});
					}
				}
			}
			// accessor properties are not copied as own from prototype, which is desired, therefore they are defined
			// on the target instance
			var propertyDescriptor;
			for (var name in instance) {
				if (!instance.hasOwnProperty(name)) {
					propertyDescriptor = properties.getDescriptor(instance, name);
					if (properties.isAccessorDescriptor(propertyDescriptor)) {
						Object.defineProperty(instance, name, propertyDescriptor);
					}
				}
			}
			return instance;
		}

		Object.defineProperties(Constructor, {
			// returns "pre-calculated" bases for a Constructor class
			_getBases: {
				value: function (prototypeFlag) {
					return prototypeFlag ? prototypes : constructors;
				}
			},
			// provides an extend function on the Constructor class
			extend: {
				value: extend,
				enumerable: true,
				configurable: true
			}
		});

		// if compose not operating in a secure mode, provides a constructor property
		if (!compose.secure) {
			Object.defineProperty(proto, 'constructor', {
				value: Constructor,
				configurable: true
			});
		}

		// sets the prototype for the Constructor
		Constructor.prototype = proto;

		return Constructor;
	}

	function decorator(install, direct) {
		// summary:
		//		Generates a Decorator function that can be used to special special properties that are required to
		//		be installed via a specific installer.
		function Decorator() {
			if (direct) {
				return direct.apply(this, arguments);
			}
			throw new Error('Decorator not applied');
		}
		Object.defineProperty(Decorator, 'install', {
			value: install,
			enumerable: true,
			configurable: true
		});
		return Decorator;
	}

	// TODO: convert to `dojo/aspect`
	function aspect(handler) {
		return function (advice) {
			return decorator(function install(name) {
				var baseMethod = this[name];
				(advice = this[name] = baseMethod ? handler(this, baseMethod, advice) : advice).install = install;
			}, advice);
		};
	}

	var stop = {};

	Object.defineProperties(compose, {

		// required: Function
		//		A "placeholder" for a property that is required to be defined in a descendent
		required: {
			value: required,
			enumerable: true,
			configurable: true
		},

		// Decorator: Function
		//		A constructor function that generates a decorator function that installs properties with a custom
		//		installer.
		Decorator: {
			value: decorator,
			enumerable: true,
			configurable: true
		},

		// stop: Object
		//		Used to determine the end of a "dependency chain" of functions that are being used for aspect advice
		stop: {
			value: stop,
			enumerable: true,
			configurable: true
		},

		// around: Function
		//		Used to generate a property that gives around aspect advice for the ancestor's property
		around: {
			value: aspect(function (target, base, advice) {
				return advice.call(target, base);
			}),
			enumerable: true
		},

		// before: Function
		//		Used to generate a property that gives before aspect advice for the ancestor's property
		before: {
			value: aspect(function (target, base, advice) {
				return function () {
					var results = advice.apply(this, arguments);
					if (results !== stop) {
						return base.apply(this, results || arguments);
					}
				};
			}),
			enumerable: true
		},

		// after: Function
		//		Used to generate a property that gives after advice for the ancestor's property
		after: {
			value: aspect(function (target, base, advice) {
				return function () {
					var results = base.apply(this, arguments),
						adviceResults = advice.apply(this, arguments);
					return adviceResults === undefined ? results : adviceResults;
				};
			}),
			enumerable: true
		},

		// property: Function
		//		Used to generate a property defined by an ES5 descriptor (which can also understand the aspect advice
		//		for the get and set functions)
		property: {
			value: function (descriptor) {
				return decorator(function (key) {
					var inheritedDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
					if (inheritedDescriptor) {
						mixin(inheritedDescriptor, [descriptor]);
					}
					Object.defineProperty(this, key, inheritedDescriptor || descriptor);
				});
			},
			enumerable: true
		},

		// from: Function
		//		"Copy" a property from a specific ancestor
		from: {
			value: function (trait, fromKey) {
				var descriptor = fromKey ? Object.getOwnPropertyDescriptor((typeof trait === 'function' ?
					trait.prototype : trait), fromKey) : null;
				return decorator(function (key) {
					descriptor = descriptor || (typeof trait === 'string' ? Object.getOwnPropertyDescriptor(this, trait) :
						Object.getOwnPropertyDescriptor((typeof trait === 'function' ? trait.prototype : trait),
							fromKey || key));
					if (descriptor) {
						Object.defineProperty(this, key, descriptor);
					}
					else {
						throw new Error('Source method ' + fromKey + ' was not available to be renamed to ' + key);
					}
				});
			},
			enumerable: true
		},

		// create: Function
		//		A convenience function to create a new instance of a composed object
		create: {
			value: function (base) {
				var instance = mixin(lang.delegate(base), Array.prototype.slice.call(arguments, 1)),
					arg;
				for (var i = 0, l = arguments.length; i < l; i++) {
					arg = arguments[i];
					if (typeof arg === 'function') {
						instance = arg.call(instance) || instance;
					}
				}
				return instance;
			},
			enumerable: true
		},

		apply: {
			value: function (self, args) {
				return self ? mixin(self, args) :
					extend.apply.call(compose, 0, args);
			}
		},
		call: {
			value: function (self) {
				return mixin(self, Array.prototype.slice.call(arguments, 1));
			}
		},

		// secure: Boolean
		//		If operating in secure mode, the constructor property will not be added to generated Constructors,
		//		thereby ensuring that the constructor cannot be manipulated by other code.
		secure: {
			value: false,
			writable: true,
			enumerable: true
		}
	});

	return compose;

});
},
'core/lang':function(){
define([
	'./properties'
], function (properties) {

	var slice = Array.prototype.slice;

	function _mixin(dest, source, copyFunc) {
		'use strict';
		// summary:
		//		Copies/adds all enumerable properties of source to dest; returns dest.
		// dest: Object
		//		The object to which to copy/add all properties contained in source.
		// source: Object
		//		The object from which to draw all properties to copy into dest.
		// copyFunc: Function?
		//		The process used to copy/add a property in source; defaults to Object.defineProperty.
		// returns:
		//		dest, as modified
		// description:
		//		All enumerable properties, including functions (sometimes termed "methods"), excluding any non-standard
		//		extensions found in Object.prototype, are copied/added to dest. Copying/adding each particular property
		//		is delegated to copyFunc (if any); this defaults to Object.defineProperty if no copyFunc is provided.
		//		Notice that by default, _mixin executes a so-called "shallow copy" and aggregate types are copied/added
		//		by reference.

		var name, value, empty = {};
		for (name in source) {
			value = source[name];
			// the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
			// inherited from Object.prototype.	 For example, if dest has a custom toString() method,
			// don't overwrite it with the toString() method that source inherited from Object.prototype
			if (!(name in dest) || (dest[name] !== value && (!(name in empty) || empty[name] !== value))) {
				// If already defined in dest or if there is a copyFunc supplied, just copy the value.
				if (copyFunc || name in dest) {
					dest[name] = copyFunc ? copyFunc(value) : value;
				} else {
					Object.defineProperty(dest, name, properties.getDescriptor(source, name));
				}
			}
		}

		return dest;
	}

	function _toArray(obj, offset, startWith) {
		'use strict';
		return (startWith || []).concat(slice.call(obj, offset || 0));
	}

	function _hitchArgs(scope, method) {
		'use strict';
		var pre = _toArray(arguments, 2);
		var named = typeof method === 'string';
		return function () {
			// arrayify arguments
			var args = _toArray(arguments);
			// locate our method
			var f = named ? window.global[method] : method;
			// invoke with collected args
			return f && f.apply(scope || this, pre.concat(args)); // mixed
		}; // Function
	}

	function getGlobal() {
		// I cannot find anything that provides access to the global scope under "use strict"
		return (function () {
			return this;
		}());
	}

	function getProp(/*Array*/parts, /*Boolean*/create, /*Object*/context) {
		'use strict';
		var p,
			i = 0,
			global = getGlobal();

		if (!context) {
			if (!parts.length) {
				return global;
			}
			else {
				p = parts[i++];
				context = p in global ? global[p] : (create ? global[p] = {} : undefined);
			}
		}
		while (context && (p = parts[i++])) {
			context = (p in context ? context[p] : (create ? context[p] = {} : undefined));
		}
		return context; // mixed
	}

	var lang = {
		// summary:
		//		This module defines Javascript language extensions.

		mixin: function (dest /*, sources...*/) {
			'use strict';
			// summary:
			//		Copies/adds all properties of one or more sources to dest; returns dest.
			// dest: Object
			//		The object to which to copy/add all properties contained in source. If dest is falsy, then
			//		a new object is manufactured before copying/adding properties begins.
			// sources: Object...
			//		One of more objects from which to draw all properties to copy into dest. sources are processed
			//		left-to-right and if more than one of these objects contain the same property name, the right-most
			//		value "wins".
			// returns: Object
			//		dest, as modified
			// description:
			//		All properties, including functions (sometimes termed "methods"), excluding any non-standard extensions
			//		found in Object.prototype, are copied/added from sources to dest. sources are processed left to right.
			//		The Javascript assignment operator is used to copy/add each property; therefore, by default, mixin
			//		executes a so-called "shallow copy" and aggregate types are copied/added by reference.
			// example:
			//		make a shallow copy of an object
			//	|	var copy = lang.mixin({}, source);
			// example:
			//		copy in properties from multiple objects
			//	|	var flattened = lang.mixin(
			//	|		{
			//	|			name: "Frylock",
			//	|			braces: true
			//	|		},
			//	|		{
			//	|			name: "Carl Brutanananadilewski"
			//	|		}
			//	|	);
			//	|
			//	|	// will print "Carl Brutanananadilewski"
			//	|	console.log(flattened.name);
			//	|	// will print "true"
			//	|	console.log(flattened.braces);

			if (!dest) {
				dest = {};
			}
			for (var i = 1, l = arguments.length; i < l; i++) {
				_mixin(dest, arguments[i]);
			}
			return dest; // Object
		},

		delegate: function (obj, props) {
			'use strict';
			var d = Object.create(typeof obj === 'function' ? obj.prototype : obj || Object.prototype);
			return props ? _mixin(d, props) : d;
		},

		/*=====
		delegate: function(obj, props){
			// summary:
			//		Returns a new object which "looks" to obj for properties which it
			//		does not have a value for. Optionally takes a bag of properties to
			//		seed the returned object with initially.
			// description:
			//		This is a small implementation of the Boodman/Crockford delegation
			//		pattern in JavaScript. An intermediate object constructor mediates
			//		the prototype chain for the returned object, using it to delegate
			//		down to obj for property lookup when object-local lookup fails.
			//		This can be thought of similarly to ES4's "wrap", save that it does
			//		not act on types but rather on pure objects.
			// obj: Object
			//		The object to delegate to for properties not found directly on the
			//		return object or in props.
			// props: Object...
			//		an object containing properties to assign to the returned object
			// returns:
			//		an Object of anonymous type
			// example:
			//	|	var foo = { bar: "baz" };
			//	|	var thinger = lang.delegate(foo, { thud: "xyzzy"});
			//	|	thinger.bar == "baz"; // delegated to foo
			//	|	foo.thud == undefined; // by definition
			//	|	thinger.thud == "xyzzy"; // mixed in from props
			//	|	foo.bar = "thonk";
			//	|	thinger.bar == "thonk"; // still delegated to foo's bar
		}
		=====*/

		clone: function (object) {
			'use strict';
			var returnValue;

			if (!object || typeof object !== 'object') {
				returnValue = object;
			}
			else if (object.nodeType && 'cloneNode' in object) {
				returnValue = object.cloneNode(true);
			}
			else if (object instanceof Date || object instanceof RegExp) {
				returnValue = new object.constructor(object);
			}
			else {
				if (Array.isArray(object)) {
					returnValue = [];
				}
				else {
					returnValue = object.constructor ? new object.constructor() : {};
				}

				_mixin(returnValue, object, lang.clone);
			}

			return returnValue;
		},

		/**
		 * Return a function bound to a specific context (this). Supports late binding.
		 *
		 * @param {Object} object
		 * The object to which to bind the context. May be null except for late binding.
		 * @param {(function()|string)} method
		 * A function or method name to bind a context to. If a string is passed, the look-up
		 * will not happen until the bound function is invoked (late-binding).
		 * @param {...?} var_args
		 * Arguments to pass to the bound function.
		 * @returns {function()}
		 */
		bind: function (context, method) {
			var extra = slice.call(arguments, 2);
			if (typeof method === 'string') {
				// late binding
				return function () {
					return context[method].apply(context, extra.concat(slice.call(arguments)));
				};
			}
			return method.bind.apply(method, [ context ].concat(extra));
		},

		hitch: function (scope, method) {
			'use strict';
			// summary:
			//		Returns a function that will only ever execute in the a given scope.
			//		This allows for easy use of object member functions
			//		in callbacks and other places in which the "this" keyword may
			//		otherwise not reference the expected scope.
			//		Any number of default positional arguments may be passed as parameters
			//		beyond "method".
			//		Each of these values will be used to "placehold" (similar to curry)
			//		for the hitched function.
			// scope: Object
			//		The scope to use when method executes. If method is a string,
			//		scope is also the object containing method.
			// method: Function|String...
			//		A function to be hitched to scope, or the name of the method in
			//		scope to be hitched.
			// example:
			//	|	lang.hitch(foo, "bar")();
			//		runs foo.bar() in the scope of foo
			// example:
			//	|	lang.hitch(foo, myFunction);
			//		returns a function that runs myFunction in the scope of foo
			// example:
			//		Expansion on the default positional arguments passed along from
			//		hitch. Passed args are mixed first, additional args after.
			//	|	var foo = { bar: function(a, b, c){ console.log(a, b, c); } };
			//	|	var fn = lang.hitch(foo, "bar", 1, 2);
			//	|	fn(3); // logs "1, 2, 3"
			// example:
			//	|	var foo = { bar: 2 };
			//	|	lang.hitch(foo, function(){ this.bar = 10; })();
			//		execute an anonymous function in scope of foo
			if (arguments.length > 2) {
				return _hitchArgs.apply(window.global, arguments); // Function
			}
			if (!method) {
				method = scope;
				scope = null;
			}
			if (typeof method === 'string') {
				scope = scope || window.global;
				if (!scope[method]) {
					throw ([ 'lang.hitch: scope["', method, '"] is null (scope="', scope, '")' ].join(''));
				}
				return function () {
					return scope[method].apply(scope, arguments || []);
				}; // Function
			}
			return !scope ? method : function () {
				return method.apply(scope, arguments || []);
			}; // Function
		},

		extend: function (ctor/*, props*/) {
			// summary:
			//		Adds all properties and methods of props to constructor's
			//		prototype, making them available to all instances created with
			//		constructor.
			// ctor: Object
			//		Target constructor to extend.
			// props: Object
			//		One or more objects to mix into ctor.prototype
			for (var i=1; i < arguments.length; i++) {
				_mixin(ctor.prototype, arguments[i]);
			}
			return ctor; // Object
		},

		setObject: function (name, value, context) {
			'use strict';
			// summary:
			//		Set a property from a dot-separated string, such as "A.B.C"
			// description:
			//		Useful for longer api chains where you have to test each object in
			//		the chain, or when you have an object reference in string format.
			//		Objects are created as needed along `path`. Returns the passed
			//		value if setting is successful or `undefined` if not.
			// name: String
			//		Path to a property, in the form "A.B.C".
			// value: anything
			//		value or object to place at location given by name
			// context: Object?
			//		Optional. Object to use as root of path. Defaults to
			//		`dojo.global`.
			// example:
			//		set the value of `foo.bar.baz`, regardless of whether
			//		intermediate objects already exist:
			//	| lang.setObject("foo.bar.baz", value);
			// example:
			//		without `lang.setObject`, we often see code like this:
			//	| // ensure that intermediate objects are available
			//	| if(!obj["parent"]){ obj.parent = {}; }
			//	| if(!obj.parent["child"]){ obj.parent.child = {}; }
			//	| // now we can safely set the property
			//	| obj.parent.child.prop = "some value";
			//		whereas with `lang.setObject`, we can shorten that to:
			//	| lang.setObject("parent.child.prop", "some value", obj);

			var parts = name.split('.'), p = parts.pop(), obj = getProp(parts, true, context);
			return obj && p ? (obj[p] = value) : undefined; // Object
		},

		getObject: function (name, create, context) {
			'use strict';
			// summary:
			//		Get a property from a dot-separated string, such as "A.B.C"
			// description:
			//		Useful for longer api chains where you have to test each object in
			//		the chain, or when you have an object reference in string format.
			// name: String
			//		Path to an property, in the form "A.B.C".
			// create: Boolean?
			//		Optional. Defaults to `false`. If `true`, Objects will be
			//		created at any point along the 'path' that is undefined.
			// context: Object?
			//		Optional. Object to use as root of path. Defaults to
			//		'dojo.global'. Null may be passed.
			return getProp(name.split('.'), create, context); // Object
		},

		getGlobal: getGlobal,

		exists: function (name, obj) {
			'use strict';
			// summary:
			//		determine if an object supports a given method
			// description:
			//		useful for longer api chains where you have to test each object in
			//		the chain. Useful for object and method detection.
			// name: String
			//		Path to an object, in the form "A.B.C".
			// obj: Object?
			//		Object to use as root of path. Defaults to
			//		'dojo.global'. Null may be passed.
			// example:
			//	| // define an object
			//	| var foo = {
			//	|		bar: { }
			//	| };
			//	|
			//	| // search the global scope
			//	| lang.exists("foo.bar"); // true
			//	| lang.exists("foo.bar.baz"); // false
			//	|
			//	| // search from a particular scope
			//	| lang.exists("bar", foo); // true
			//	| lang.exists("bar.baz", foo); // false
			return lang.getObject(name, false, obj) !== undefined; // Boolean
		}
	};

	return lang;
});
},
'core/properties':function(){
define([
], function () {
	'use strict';

	var hasOwnProp = Object.prototype.hasOwnProperty,
		getPrototypeOf = Object.getPrototypeOf,
		getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
		defineProperty = Object.defineProperty;

	return {
		/**
		 * Returns a property descriptor from an object for the supplied property name.
		 *
		 * Ascends the prototype of the object until it can find the property descriptor for the object, returning
		 * `undefined` if not found within its inheritance chain.
		 * @param  {Object} obj  The object that should be inspected for property descriptor
		 * @param  {String} name The name of the property to find a property descriptor for
		 * @return {Object}      The descriptor if found
		 */
		getDescriptor: function (obj, name) {
			while (obj && !hasOwnProp.call(obj, name)) {
				obj = getPrototypeOf(obj);
			}
			return obj ? getOwnPropertyDescriptor(obj, name) : undefined;
		},

		/**
		 * Returns `true` if the provided descriptor is a data descriptor, otherwise `false`
		 * @param  {Object}  descriptor The descriptor to inspect
		 * @return {Boolean}            If the supplied descriptor is a data descriptor
		 */
		isAccessorDescriptor: function (descriptor) {
			return descriptor ? 'get' in descriptor || 'set' in descriptor : false;
		},

		/**
		 * Returns `true` if the provided descriptor is an accessor descriptor, otherwise `false`
		 * @param  {Object}  descriptor The descriptor to inspect
		 * @return {Boolean}            If the supplied descriptor is an accessor descriptor
		 */
		isDataDescriptor: function (descriptor) {
			return descriptor ? 'value' in descriptor || 'writable' in descriptor : false;
		},

		/**
		 * Removes a property, including from its inheritance chain.
		 *
		 * Ascends the prototype of the object, deleting any occurrences of the named property.  This is useful when
		 * wanting to ensure that if a configurable property is defined somewhere in the inheritance chain, it does not
		 * get persisted when using the object as a prototype for another object.
		 * @param  {Object} obj  The object that should be deleted from
		 * @param  {String} name The name of the property to remove
		 */
		remove: function (obj, name) {
			do {
				if (obj && hasOwnProp.call(obj, name)) {
					delete obj[name];
				}
			}
			while ((obj = getPrototypeOf(obj)));
		},

		/**
		 * Creates a non-enumerable property with an appended `_` in front of the name.
		 * @param  {Object} obj   The object that the property should be created on
		 * @param  {String} name  The name of the property to be shadowed
		 * @param  {Mixed}  value The value of the property
		 * @return {Mixed}        The value that was set
		 */
		shadow: function (obj, name, value) {
			defineProperty(obj, '_' + name, {
				value: value,
				configurable: true
			});
			return value;
		},

		/**
		 * Creates a ready only property, with a supplied value
		 * @param  {Object} obj   The object that the property should be created on
		 * @param  {String} name  The name of the property
		 * @param  {Mixed}  value The value of the property
		 * @return {Mixed}        The value that was set
		 */
		readOnly: function (obj, name, value) {
			defineProperty(obj, name, {
				value: value,
				enumerable: true,
				configurable: true
			});
			return value;
		}
	};

});
},
'core/has':function(){
define([ 'require' ], function (require) {
	// module:
	//		dojo/has
	// summary:
	//		Defines the has.js API and several feature tests used by dojo.
	// description:
	//		This module defines the has API as described by the project has.js with the following additional features:
	//
	//		- the method has.add includes a forth parameter that controls whether or not existing tests are replaced
	//		- the loader's has cache may be optionally copied into this module's has cahce.
	//
	//		This module adopted from https://github.com/phiggins42/has.js; thanks has.js team!

	// try to pull the has implementation from the loader; both the dojo loader and bdLoad provide one
	// if using a foreign loader, then the has cache may be initialized via the config object for this module
	// WARNING: if a foreign loader defines require.has to be something other than the has.js API, then this implementation fail
	var has = require.has;

	//if (/*!has*/ false) {
	//	var
	//		isBrowser =
	//			// the most fundamental decision: are we in the browser?
	//			typeof window != "undefined" &&
	//			typeof location != "undefined" &&
	//			typeof document != "undefined" &&
	//			window.location == location && window.document == document,
	//
	//		// has API variables
	//		global = this,
	//		doc = isBrowser && document,
	//		element = doc && doc.createElement("DiV"),
	//		cache = (module.config && module.config()) || {};
	//
	//	has = function(name){
	//		// summary:
	//		//		Return the current value of the named feature.
	//		//
	//		// name: String|Integer
	//		//		The name (if a string) or identifier (if an integer) of the feature to test.
	//		//
	//		// description:
	//		//		Returns the value of the feature named by name. The feature must have been
	//		//		previously added to the cache by has.add.
	//
	//		return typeof cache[name] == "function" ? (cache[name] = cache[name](global, doc, element)) : cache[name]; // Boolean
	//	};
	//
	//	has.cache = cache;
	//
	//	has.add = function(name, test, now, force){
	//		// summary:
	//		//	 	Register a new feature test for some named feature.
	//		// name: String|Integer
	//		//	 	The name (if a string) or identifier (if an integer) of the feature to test.
	//		// test: Function
	//		//		 A test function to register. If a function, queued for testing until actually
	//		//		 needed. The test function should return a boolean indicating
	//		//	 	the presence of a feature or bug.
	//		// now: Boolean?
	//		//		 Optional. Omit if `test` is not a function. Provides a way to immediately
	//		//		 run the test and cache the result.
	//		// force: Boolean?
	//		//	 	Optional. If the test already exists and force is truthy, then the existing
	//		//	 	test will be replaced; otherwise, add does not replace an existing test (that
	//		//	 	is, by default, the first test advice wins).
	//		// example:
	//		//		A redundant test, testFn with immediate execution:
	//		//	|	has.add("javascript", function(){ return true; }, true);
	//		//
	//		// example:
	//		//		Again with the redundantness. You can do this in your tests, but we should
	//		//		not be doing this in any internal has.js tests
	//		//	|	has.add("javascript", true);
	//		//
	//		// example:
	//		//		Three things are passed to the testFunction. `global`, `document`, and a generic element
	//		//		from which to work your test should the need arise.
	//		//	|	has.add("bug-byid", function(g, d, el){
	//		//	|		// g	== global, typically window, yadda yadda
	//		//	|		// d	== document object
	//		//	|		// el == the generic element. a `has` element.
	//		//	|		return false; // fake test, byid-when-form-has-name-matching-an-id is slightly longer
	//		//	|	});
	//
	//		(typeof cache[name]=="undefined" || force) && (cache[name]= test);
	//		return now && has(name);
	//	};
	//}

	if ( 1 ) {
		// Common application level tests
		 1 || has.add('dom', true);
		has.add('touch', 'ontouchstart' in document);
	}

	/**
	 * Resolves id into a module id based on possibly-nested tenary expression that branches on has feature test
	 * value(s).
	 *
	 * @param toAbsMid
	 * Resolves a relative module id into an absolute module id.
	 */
	has.normalize = function (/**string*/ id, /**Function*/ toAbsMid) {
		var tokens = id.match(/[\?:]|[^:\?]*/g),
			i = 0,
			get = function (skip) {
				var term = tokens[i++];
				if (term === ':') {
					// empty string module name, resolves to 0
					return 0;
				}
				else {
					// postfixed with a ? means it is a feature to branch on, the term is the name of the feature
					if (tokens[i++] === '?') {
						if (!skip && has(term)) {
							// matched the feature, get the first value from the options
							return get();
						}
						else {
							// did not match, get the second value, passing over the first
							get(true);
							return get(skip);
						}
					}

					// a module
					return term || 0;
				}
			};

		id = get();
		return id && toAbsMid(id);
	};

	/**
	 * Conditional loading of AMD modules based on a has feature test value.
	 *
	 * @param id
	 * Gives the resolved module id to load.
	 *
	 * @param parentRequire
	 * The loader require function with respect to the module that contained the plugin resource in its dependency
	 * list.
	 *
	 * @param loaded
	 * Callback to loader that consumes result of plugin demand.
	 */
	has.load = function (/**string*/ id, /**Function*/ parentRequire, /**Function*/ loaded) {
		if (id) {
			parentRequire([ id ], loaded);
		}
		else {
			loaded();
		}
	};

	return has;
});
},
'core/on':function(){
define([
	'./has!dom-addeventlistener?:./aspect',
	'./sniff'
], function (aspect, has) {
	'use strict';

	if ( 1 ) { // check to make sure we are in a browser, this module should work anywhere
		var major = window.ScriptEngineMajorVersion;
		has.add('jscript', major && (major() + ScriptEngineMinorVersion() / 10));
		has.add('event-orientationchange', has('touch') && !has('android')); // TODO: how do we detect this?
		has.add('event-stopimmediatepropagation', window.Event && !!window.Event.prototype && !!window.Event.prototype.stopImmediatePropagation);
		has.add('event-focusin', function (global, doc, element) {
			// All browsers except firefox support focusin, but too hard to feature test webkit since element.onfocusin
			// is undefined.  Just return true for IE and use fallback path for other browsers.
			return !!element.attachEvent;
		});
	}
	var on = function (target, type, listener, dontFix) {
		// summary:
		//		A function that provides core event listening functionality. With this function
		//		you can provide a target, event type, and listener to be notified of
		//		future matching events that are fired.
		// target: Element|Object
		//		This is the target object or DOM element that to receive events from
		// type: String|Function
		//		This is the name of the event to listen for or an extension event type.
		// listener: Function
		//		This is the function that should be called when the event fires.
		// returns: Object
		//		An object with a remove() method that can be used to stop listening for this
		//		event.
		// description:
		//		To listen for 'click' events on a button node, we can do:
		//		|	define(['dojo/on'], function (listen) {
		//		|		on(button, 'click', clickHandler);
		//		|		...
		//		Evented JavaScript objects can also have their own events.
		//		|	var obj = new Evented;
		//		|	on(obj, 'foo', fooHandler);
		//		And then we could publish a 'foo' event:
		//		|	on.emit(obj, 'foo', {key: 'value'});
		//		We can use extension events as well. For example, you could listen for a tap gesture:
		//		|	define(['dojo/on', 'dojo/gesture/tap', function (listen, tap) {
		//		|		on(button, tap, tapHandler);
		//		|		...
		//		which would trigger fooHandler. Note that for a simple object this is equivalent to calling:
		//		|	obj.onfoo({key:'value'});
		//		If you use on.emit on a DOM node, it will use native event dispatching when possible.

		if (typeof target.on === 'function' && typeof type !== 'function' && !target.nodeType) {
			// delegate to the target's on() method, so it can handle it's own listening if it wants (unless it 
			// is DOM node and we may be dealing with jQuery or Prototype's incompatible addition to the
			// Element prototype 
			return target.on(type, listener);
		}
		// delegate to main listener code
		return on.parse(target, type, listener, addListener, dontFix, this);
	};
	on.pausable =  function (target, type, listener, dontFix) {
		// summary:
		//		This function acts the same as on(), but with pausable functionality. The
		//		returned signal object has pause() and resume() functions. Calling the
		//		pause() method will cause the listener to not be called for future events. Calling the
		//		resume() method will cause the listener to again be called for future events.
		var paused;
		var signal = on(target, type, function () {
			if (!paused) {
				return listener.apply(this, arguments);
			}
		}, dontFix);
		signal.pause = function () {
			paused = true;
		};
		signal.resume = function () {
			paused = false;
		};
		return signal;
	};
	on.once = function (target, type, listener, dontFix) {
		// summary:
		//		This function acts the same as on(), but will only call the listener once. The 
		//		listener will be called for the first
		//		event that takes place and then listener will automatically be removed.
		var signal = on(target, type, function () {
			// remove this listener
			signal.remove();
			// proceed to call the listener
			return listener.apply(this, arguments);
		});
		return signal;
	};
	on.parse = function (target, type, listener, addListener, dontFix, matchesTarget) {
		if (type.call) {
			// event handler function
			// on(node, touch.press, touchListener);
			return type.call(matchesTarget, target, listener);
		}

		if (type.indexOf(',') > -1) {
			// we allow comma delimited event names, so you can register for multiple events at once
			var events = type.split(/\s*,\s*/);
			var handles = [];
			var i = 0;
			var eventName;
			while (eventName = events[i++]) {
				handles.push(addListener(target, eventName, listener, dontFix, matchesTarget));
			}
			handles.remove = function () {
				for (var i = 0; i < handles.length; i++) {
					handles[i].remove();
				}
			};
			return handles;
		}
		return addListener(target, type, listener, dontFix, matchesTarget);
	};
	var touchEvents = /^touch/;
	function addListener(target, type, listener, dontFix, matchesTarget) {
		// event delegation:
		var selector = type.match(/(.*):(.*)/);
		// if we have a selector:event, the last one is interpreted as an event, and we use event delegation
		if (selector) {
			type = selector[2];
			selector = selector[1];
			// create the extension event for selectors and directly call it
			return on.selector(selector, type).call(matchesTarget, target, listener);
		}
		// test to see if it a touch event right now, so we don't have to do it every time it fires
		if (has('touch')) {
			if (touchEvents.test(type)) {
				// touch event, fix it
				listener = fixTouchListener(listener);
			}
			if (!has('event-orientationchange') && (type === 'orientationchange')) {
				//'orientationchange' not supported <= Android 2.1, 
				//but works through 'resize' on window
				type = 'resize';
				target = window;
				listener = fixTouchListener(listener);
			}
		}
		if (addStopImmediate) {
			// add stopImmediatePropagation if it doesn't exist
			listener = addStopImmediate(listener);
		}
		// normal path, the target is |this|
		if (target.addEventListener) {
			// the target has addEventListener, which should be used if available (might or might not be a node, non-nodes can implement this method as well)
			// check for capture conversions
			var capture = type in captures,
				adjustedType = capture ? captures[type] : type;
			target.addEventListener(adjustedType, listener, capture);
			// create and return the signal
			return {
				remove: function () {
					target.removeEventListener(adjustedType, listener, capture);
				}
			};
		}
		type = 'on' + type;
		if (fixAttach && target.attachEvent) {
			return fixAttach(target, type, listener);
		}
		throw new Error('Target must be an event emitter');
	}

	on.selector = function (selector, eventType, children) {
		// summary:
		//		Creates a new extension event with event delegation. This is based on
		//		the provided event type (can be extension event) that
		//		only calls the listener when the CSS selector matches the target of the event.
		//
		//		The application must require() an appropriate level of dojo/query to handle the selector.
		// selector:
		//		The CSS selector to use for filter events and determine the |this| of the event listener.
		// eventType:
		//		The event to listen for
		// children:
		//		Indicates if children elements of the selector should be allowed. This defaults to 
		//		true
		// example:
		// |	require(['dojo/on', 'dojo/mouse', 'dojo/query!css2'], function (listen, mouse) {
		// |		on(node, on.selector('.my-class', mouse.enter), handlerForMyHover);
		return function (target, listener) {
			// if the selector is function, use it to select the node, otherwise use the matches method
			var matchesTarget = typeof selector === 'function' ? {matches: selector} : this,
				bubble = eventType.bubble;
			function select(eventTarget) {
				// see if we have a valid matchesTarget or default to dojo.query
				// Shouldn't need this anymore... on <= IE8
				//matchesTarget = matchesTarget && matchesTarget.matches ? matchesTarget : dojo.query;
				// there is a selector, so make sure it matches
				while (!matchesTarget.matches(eventTarget, selector, target)) {
					if (eventTarget === target || children === false || !(eventTarget = eventTarget.parentNode) || eventTarget.nodeType !== 1) { // intentional assignment
						return;
					}
				}
				return eventTarget;
			}
			if (bubble) {
				// the event type doesn't naturally bubble, but has a bubbling form, use that, and give it the selector so it can perform the select itself
				return on(target, bubble(select), listener);
			}
			// standard event delegation
			return on(target, eventType, function (event) {
				// call select to see if we match
				var eventTarget = select(event.target);
				// if it matches we call the listener
				return eventTarget && listener.call(eventTarget, event);
			});
		};
	};

	function syntheticPreventDefault() {
		this.cancelable = false;
		this.defaultPrevented = true;
	}
	function syntheticStopPropagation() {
		this.bubbles = false;
	}
	var slice = [].slice,
		syntheticDispatch = on.emit = function (target, type, event) {
		// summary:
		//		Fires an event on the target object.
		// target:
		//		The target object to fire the event on. This can be a DOM element or a plain 
		//		JS object. If the target is a DOM element, native event emitting mechanisms
		//		are used when possible.
		// type:
		//		The event type name. You can emulate standard native events like 'click' and 
		//		'mouseover' or create custom events like 'open' or 'finish'.
		// event:
		//		An object that provides the properties for the event. See https://developer.mozilla.org/en/DOM/event.initEvent 
		//		for some of the properties. These properties are copied to the event object.
		//		Of particular importance are the cancelable and bubbles properties. The
		//		cancelable property indicates whether or not the event has a default action
		//		that can be cancelled. The event is cancelled by calling preventDefault() on
		//		the event object. The bubbles property indicates whether or not the
		//		event will bubble up the DOM tree. If bubbles is true, the event will be called
		//		on the target and then each parent successively until the top of the tree
		//		is reached or stopPropagation() is called. Both bubbles and cancelable 
		//		default to false.
		// returns:
		//		If the event is cancelable and the event is not cancelled,
		//		emit will return true. If the event is cancelable and the event is cancelled,
		//		emit will return false.
		// details:
		//		Note that this is designed to emit events for listeners registered through
		//		dojo/on. It should actually work with any event listener except those
		//		added through IE's attachEvent (IE8 and below's non-W3C event emitting
		//		doesn't support custom event types). It should work with all events registered
		//		through dojo/on. Also note that the emit method does do any default
		//		action, it only returns a value to indicate if the default action should take
		//		place. For example, emitting a keypress event would not cause a character
		//		to appear in a textbox.
		// example:
		//		To fire our own click event
		//	|	on.emit(dojo.byId('button'), 'click', {
		//	|		cancelable: true,
		//	|		bubbles: true,
		//	|		screenX: 33,
		//	|		screenY: 44
		//	|	});
		//		We can also fire our own custom events:
		//	|	on.emit(dojo.byId('slider'), 'slide', {
		//	|		cancelable: true,
		//	|		bubbles: true,
		//	|		direction: 'left-to-right'
		//	|	});
		var args = slice.call(arguments, 2);
		var method = 'on' + type;
		if ('parentNode' in target) {
			// node (or node-like), create event controller methods
			var newEvent = args[0] = {};
			for (var i in event) {
				newEvent[i] = event[i];
			}
			newEvent.preventDefault = syntheticPreventDefault;
			newEvent.stopPropagation = syntheticStopPropagation;
			newEvent.target = target;
			newEvent.type = type;
			event = newEvent;
		}
		do {
			// call any node which has a handler (note that ideally we would try/catch to simulate normal event propagation but that causes too much pain for debugging)
			target[method] && target[method].apply(target, args);
			// and then continue up the parent node chain if it is still bubbling (if started as bubbles and stopPropagation hasn't been called)
		} while (event && event.bubbles && (target = target.parentNode));
		return event && event.cancelable && event; // if it is still true (was cancelable and was cancelled), return the event to indicate default action should happen
	};
	var captures = has('event-focusin') ? {} : {focusin: 'focus', focusout: 'blur'};
	if (!has('event-stopimmediatepropagation')) {
		var stopImmediatePropagation = function () {
			this.immediatelyStopped = true;
			this.modified = true; // mark it as modified so the event will be cached in IE
		};
		var addStopImmediate = function (listener) {
			return function (event) {
				if (!event.immediatelyStopped) {// check to make sure it hasn't been stopped immediately
					event.stopImmediatePropagation = stopImmediatePropagation;
					return listener.apply(this, arguments);
				}
			};
		};
	}
	if (has('dom-addeventlistener')) {
		// emitter that works with native event handling
		on.emit = function (target, type, event) {
			if (target.dispatchEvent && document.createEvent) {
				// use the native event emitting mechanism if it is available on the target object
				// create a generic event				
				// we could create branch into the different types of event constructors, but 
				// that would be a lot of extra code, with little benefit that I can see, seems 
				// best to use the generic constructor and copy properties over, making it 
				// easy to have events look like the ones created with specific initializers
				var nativeEvent = target.ownerDocument.createEvent('HTMLEvents');
				nativeEvent.initEvent(type, !!event.bubbles, !!event.cancelable);
				// and copy all our properties over
				for (var i in event) {
					if (!(i in nativeEvent)) {
						nativeEvent[i] = event[i];
					}
				}
				return target.dispatchEvent(nativeEvent) && nativeEvent;
			}
			return syntheticDispatch.apply(on, arguments); // emit for a non-node
		};
	}
	else {
		// no addEventListener, basically old IE event normalization
		on._fixEvent = function (evt, sender) {
			// summary:
			//		normalizes properties on the event object including event
			//		bubbling methods, keystroke normalization, and x/y positions
			// evt:
			//		native event object
			// sender:
			//		node to treat as 'currentTarget'
			if (!evt) {
				var w = sender && (sender.ownerDocument || sender.document || sender).parentWindow || window;
				evt = w.event;
			}
			if (!evt) {
				return evt;
			}
			try {
				if (lastEvent && evt.type === lastEvent.type  && evt.srcElement === lastEvent.target) {
					// should be same event, reuse event object (so it can be augmented);
					// accessing evt.srcElement rather than evt.target since evt.target not set on IE until fixup below
					evt = lastEvent;
				}
			}
			catch (e) {
				// will occur on IE on lastEvent.type reference if lastEvent points to a previous event that already
				// finished bubbling, but the setTimeout() to clear lastEvent hasn't fired yet
			}
			if (!evt.target) { // check to see if it has been fixed yet
				evt.target = evt.srcElement;
				evt.currentTarget = (sender || evt.srcElement);
				if (evt.type === 'mouseover') {
					evt.relatedTarget = evt.fromElement;
				}
				if (evt.type === 'mouseout') {
					evt.relatedTarget = evt.toElement;
				}
				if (!evt.stopPropagation) {
					evt.stopPropagation = stopPropagation;
					evt.preventDefault = preventDefault;
				}
				switch (evt.type) {
				case 'keypress':
					var c = ('charCode' in evt ? evt.charCode : evt.keyCode);
					if (c === 10) {
						// CTRL-ENTER is CTRL-ASCII(10) on IE, but CTRL-ENTER on Mozilla
						c = 0;
						evt.keyCode = 13;
					}
					else if (c === 13 || c === 27) {
						c = 0; // Mozilla considers ENTER and ESC non-printable
					}
					else if (c === 3) {
						c = 99; // Mozilla maps CTRL-BREAK to CTRL-c
					}
					// Mozilla sets keyCode to 0 when there is a charCode
					// but that stops the event on IE.
					evt.charCode = c;
					_setKeyChar(evt);
					break;
				}
			}
			return evt;
		};
		var lastEvent, IESignal = function (handle) {
			this.handle = handle;
		};
		IESignal.prototype.remove = function () {
			delete _dojoIEListeners_[this.handle];
		};
		var fixListener = function (listener) {
			// this is a minimal function for closing on the previous listener with as few as variables as possible
			return function (evt) {
				evt = on._fixEvent(evt, this);
				var result = listener.call(this, evt);
				if (evt.modified) {
					// cache the last event and reuse it if we can
					if (!lastEvent) {
						setTimeout(function () {
							lastEvent = null;
						});
					}
					lastEvent = evt;
				}
				return result;
			};
		};
		var fixAttach = function (target, type, listener) {
			listener = fixListener(listener);
			if (((target.ownerDocument ? target.ownerDocument.parentWindow : target.parentWindow || target.window || window) !== top ||
						has('jscript') < 5.8) &&
					!has('config-_allow_leaks')) {
				// IE will leak memory on certain handlers in frames (IE8 and earlier) and in unattached DOM nodes for JScript 5.7 and below.
				// Here we use global redirection to solve the memory leaks
				if (typeof _dojoIEListeners_ === 'undefined') {
					_dojoIEListeners_ = [];
				}
				var emitter = target[type];
				if (!emitter || !emitter.listeners) {
					var oldListener = emitter;
					/* jshint evil:true */
					emitter = new Function('event', 'var callee = arguments.callee; for(var i = 0; i<callee.listeners.length; i++) {var listener = _dojoIEListeners_[callee.listeners[i]]; if (listener) {listener.call(this,event);}}');
					emitter.listeners = [];
					target[type] = emitter;
					emitter.global = this;
					if (oldListener) {
						emitter.listeners.push(_dojoIEListeners_.push(oldListener) - 1);
					}
				}
				var handle;
				emitter.listeners.push(handle = (emitter.global._dojoIEListeners_.push(listener) - 1));
				return new IESignal(handle);
			}
			return aspect.after(target, type, listener, true);
		};

		var _setKeyChar = function (evt) {
			evt.keyChar = evt.charCode ? String.fromCharCode(evt.charCode) : '';
			evt.charOrCode = evt.keyChar || evt.keyCode;
		};
		// Called in Event scope
		var stopPropagation = function () {
			this.cancelBubble = true;
		};
		var preventDefault = on._preventDefault = function () {
			// Setting keyCode to 0 is the only way to prevent certain keypresses (namely
			// ctrl-combinations that correspond to menu accelerator keys).
			// Otoh, it prevents upstream listeners from getting this information
			// Try to split the difference here by clobbering keyCode only for ctrl
			// combinations. If you still need to access the key upstream, bubbledKeyCode is
			// provided as a workaround.
			this.bubbledKeyCode = this.keyCode;
			if (this.ctrlKey) {
				try {
					// squelch errors when keyCode is read-only
					// (e.g. if keyCode is ctrl or shift)
					this.keyCode = 0;
				}
				catch (e) {}
			}
			this.defaultPrevented = true;
			this.returnValue = false;
			this.modified = true; // mark it as modified  (for defaultPrevented flag) so the event will be cached in IE
		};
	}
	if (has('touch')) {
		var Event = function () {};
		var windowOrientation = window.orientation;
		var fixTouchListener = function (listener) {
			return function (originalEvent) {
				//Event normalization(for ontouchxxx and resize): 
				//1.incorrect e.pageX|pageY in iOS 
				//2.there are no 'e.rotation', 'e.scale' and 'onorientationchange' in Android
				//3.More TBD e.g. force | screenX | screenX | clientX | clientY | radiusX | radiusY

				// see if it has already been corrected
				var event = originalEvent.corrected;
				if (!event) {
					var type = originalEvent.type;
					try {
						delete originalEvent.type; // on some JS engines (android), deleting properties make them mutable
					}
					catch (e) {}
					if (originalEvent.type) {
						// deleting properties doesn't work (older iOS), have to use delegation
						if (has('mozilla')) {
							// Firefox doesn't like delegated properties, so we have to copy
							event = {};
							for (var name in originalEvent) {
								event[name] = originalEvent[name];
							}
						}
						else {
							// old iOS branch
							Event.prototype = originalEvent;
							event = new Event();
						}
						// have to delegate methods to make them work
						event.preventDefault = function () {
							originalEvent.preventDefault();
						};
						event.stopPropagation = function () {
							originalEvent.stopPropagation();
						};
					}
					else {
						// deletion worked, use property as is
						event = originalEvent;
						event.type = type;
					}
					originalEvent.corrected = event;
					if (type === 'resize') {
						if (windowOrientation === window.orientation) {
							return null;//double tap causes an unexpected 'resize' in Android
						}
						windowOrientation = window.orientation;
						event.type = 'orientationchange';
						return listener.call(this, event);
					}
					// We use the original event and augment, rather than doing an expensive mixin operation
					if (!('rotation' in event)) { // test to see if it has rotation
						event.rotation = 0;
						event.scale = 1;
					}
					//use event.changedTouches[0].pageX|pageY|screenX|screenY|clientX|clientY|target
					var firstChangeTouch = event.changedTouches[0];
					for (var i in firstChangeTouch) { // use for-in, we don't need to have dependency on dojo/_base/lang here
						delete event[i]; // delete it first to make it mutable
						event[i] = firstChangeTouch[i];
					}
				}
				return listener.call(this, event);
			};
		};
	}
	return on;
});

},
'core/sniff':function(){
define([
	'./has'
], function (has) {
	// module:
	//		dojo/sniff

	/*=====
	return function () {
		// summary:
		//		This module sets has() flags based on the current browser.
		//		It returns the has() function.
	};
	=====*/

	if ( 1 ) {
		var n = navigator,
			dua = n.userAgent,
			dav = n.appVersion,
			tv = parseFloat(dav);

		has.add('air', dua.indexOf('AdobeAIR') >= 0);
		has.add('msapp', parseFloat(dua.split('MSAppHost/')[1]) || undefined);
		has.add('khtml', dav.indexOf('Konqueror') >= 0 ? tv : undefined);
		has.add('webkit', parseFloat(dua.split('WebKit/')[1]) || undefined);
		has.add('chrome', parseFloat(dua.split('Chrome/')[1]) || undefined);
		has.add('safari', dav.indexOf('Safari') >= 0 && !has('chrome') ? parseFloat(dav.split('Version/')[1]) : undefined);
		has.add('mac', dav.indexOf('Macintosh') >= 0);
		 0 && has.add('quirks', document.compatMode === 'BackCompat');
		if (dua.match(/(iPhone|iPod|iPad)/)) {
			var p = RegExp.$1.replace(/P/, 'p');
			var v = dua.match(/OS ([\d_]+)/) ? RegExp.$1 : '1';
			var os = parseFloat(v.replace(/_/, '.').replace(/_/g, ''));
			has.add(p, os);		// 'iphone', 'ipad' or 'ipod'
			has.add('ios', os);
		}
		has.add('android', parseFloat(dua.split('Android ')[1]) || undefined);
		has.add('bb', (dua.indexOf('BlackBerry') >= 0 || dua.indexOf('BB10') >= 0) && parseFloat(dua.split('Version/')[1]) || undefined);

		has.add('svg', typeof SVGAngle !== 'undefined');

		if (!has('webkit')) {
			// Opera
			if (dua.indexOf('Opera') >= 0) {
				// see http://dev.opera.com/articles/view/opera-ua-string-changes and http://www.useragentstring.com/pages/Opera/
				// 9.8 has both styles; <9.8, 9.9 only old style
				 0 && has.add('opera', tv >= 9.8 ? parseFloat(dua.split('Version/')[1]) || tv : tv);
			}

			// Mozilla and firefox
			if (dua.indexOf('Gecko') >= 0 && !has('khtml') && !has('webkit')) {
				has.add('mozilla', tv);
			}
			if (has('mozilla')) {
				//We really need to get away from this. Consider a sane isGecko approach for the future.
				has.add('ff', parseFloat(dua.split('Firefox/')[1] || dua.split('Minefield/')[1]) || undefined);
			}

			// IE
			if (document.all && ! 0 ) {
				var isIE = parseFloat(dav.split('MSIE ')[1]) || undefined;

				//In cases where the page has an HTTP header or META tag with
				//X-UA-Compatible, then it is in emulation mode.
				//Make sure isIE reflects the desired version.
				//document.documentMode of 5 means quirks mode.
				//Only switch the value if documentMode's major version
				//is different from isIE's major version.
				var mode = document.documentMode;
				if (mode && mode !== 5 && Math.floor(isIE) !== mode) {
					isIE = mode;
				}

				has.add('ie', isIE);
			}

			// Wii
			has.add('wii', typeof opera !== 'undefined' && opera.wiiremote);
		}
	}

	return has;
});

},
'dojo/domReady':function(){
define(['./has'], function(has){
	var global = this,
		doc = document,
		readyStates = { 'loaded': 1, 'complete': 1 },
		fixReadyState = typeof doc.readyState != "string",
		ready = !!readyStates[doc.readyState],
		readyQ = [],
		recursiveGuard;

	function domReady(callback){
		// summary:
		//		Plugin to delay require()/define() callback from firing until the DOM has finished loading.
		readyQ.push(callback);
		if(ready){ processQ(); }
	}
	domReady.load = function(id, req, load){
		domReady(load);
	};

	// Export queue so that ready() can check if it's empty or not.
	domReady._Q = readyQ;
	domReady._onQEmpty = function(){
		// summary:
		//		Private method overridden by dojo/ready, to notify when everything in the
		//		domReady queue has been processed.  Do not use directly.
		//		Will be removed in 2.0, along with domReady._Q.
	};

	// For FF <= 3.5
	if(fixReadyState){ doc.readyState = "loading"; }

	function processQ(){
		// Calls all functions in the queue in order, unless processQ() is already running, in which case just return

		if(recursiveGuard){ return; }
		recursiveGuard = true;

		while(readyQ.length){
			try{
				(readyQ.shift())(doc);
			}catch(err){
				console.log("Error on domReady callback: " + err);
			}
		}

		recursiveGuard = false;

		// Notification for dojo/ready.  Remove for 2.0.
		// Note that this could add more tasks to the ready queue.
		domReady._onQEmpty();
	}

	if(!ready){
		var tests = [],
			detectReady = function(evt){
				evt = evt || global.event;
				if(ready || (evt.type == "readystatechange" && !readyStates[doc.readyState])){ return; }

				// For FF <= 3.5
				if(fixReadyState){ doc.readyState = "complete"; }

				ready = 1;
				processQ();
			},
			on = function(node, event){
				node.addEventListener(event, detectReady, false);
				readyQ.push(function(){ node.removeEventListener(event, detectReady, false); });
			};

		if(!has("dom-addeventlistener")){
			on = function(node, event){
				event = "on" + event;
				node.attachEvent(event, detectReady);
				readyQ.push(function(){ node.detachEvent(event, detectReady); });
			};

			var div = doc.createElement("div");
			try{
				if(div.doScroll && global.frameElement === null){
					// the doScroll test is only useful if we're in the top-most frame
					tests.push(function(){
						// Derived with permission from Diego Perini's IEContentLoaded
						// http://javascript.nwbox.com/IEContentLoaded/
						try{
							div.doScroll("left");
							return 1;
						}catch(e){}
					});
				}
			}catch(e){}
		}

		on(doc, "DOMContentLoaded");
		on(global, "load");

		if("onreadystatechange" in doc){
			on(doc, "readystatechange");
		}else if(!fixReadyState){
			// if the ready state property exists and there's
			// no readystatechange event, poll for the state
			// to change
			tests.push(function(){
				return readyStates[doc.readyState];
			});
		}

		if(tests.length){
			var poller = function(){
				if(ready){ return; }
				var i = tests.length;
				while(i--){
					if(tests[i]()){
						detectReady("poller");
						return;
					}
				}
				setTimeout(poller, 30);
			};
			poller();
		}
	}

	return domReady;
});

},
'dojo/has':function(){
define(["require", "module"], function(require, module){
	// module:
	//		dojo/has
	// summary:
	//		Defines the has.js API and several feature tests used by dojo.
	// description:
	//		This module defines the has API as described by the project has.js with the following additional features:
	//
	//		- the has test cache is exposed at has.cache.
	//		- the method has.add includes a forth parameter that controls whether or not existing tests are replaced
	//		- the loader's has cache may be optionally copied into this module's has cahce.
	//
	//		This module adopted from https://github.com/phiggins42/has.js; thanks has.js team!

	// try to pull the has implementation from the loader; both the dojo loader and bdLoad provide one
	// if using a foreign loader, then the has cache may be initialized via the config object for this module
	// WARNING: if a foreign loader defines require.has to be something other than the has.js API, then this implementation fail
	var has = require.has || function(){};
	if(! 1 ){
		var
			isBrowser =
				// the most fundamental decision: are we in the browser?
				typeof window != "undefined" &&
				typeof location != "undefined" &&
				typeof document != "undefined" &&
				window.location == location && window.document == document,

			// has API variables
			global = this,
			doc = isBrowser && document,
			element = doc && doc.createElement("DiV"),
			cache = (module.config && module.config()) || {};

		has = function(name){
			// summary:
			//		Return the current value of the named feature.
			//
			// name: String|Integer
			//		The name (if a string) or identifier (if an integer) of the feature to test.
			//
			// description:
			//		Returns the value of the feature named by name. The feature must have been
			//		previously added to the cache by has.add.

			return typeof cache[name] == "function" ? (cache[name] = cache[name](global, doc, element)) : cache[name]; // Boolean
		};

		has.cache = cache;

		has.add = function(name, test, now, force){
			// summary:
			//	 	Register a new feature test for some named feature.
			// name: String|Integer
			//	 	The name (if a string) or identifier (if an integer) of the feature to test.
			// test: Function
			//		 A test function to register. If a function, queued for testing until actually
			//		 needed. The test function should return a boolean indicating
			//	 	the presence of a feature or bug.
			// now: Boolean?
			//		 Optional. Omit if `test` is not a function. Provides a way to immediately
			//		 run the test and cache the result.
			// force: Boolean?
			//	 	Optional. If the test already exists and force is truthy, then the existing
			//	 	test will be replaced; otherwise, add does not replace an existing test (that
			//	 	is, by default, the first test advice wins).
			// example:
			//		A redundant test, testFn with immediate execution:
			//	|	has.add("javascript", function(){ return true; }, true);
			//
			// example:
			//		Again with the redundantness. You can do this in your tests, but we should
			//		not be doing this in any internal has.js tests
			//	|	has.add("javascript", true);
			//
			// example:
			//		Three things are passed to the testFunction. `global`, `document`, and a generic element
			//		from which to work your test should the need arise.
			//	|	has.add("bug-byid", function(g, d, el){
			//	|		// g	== global, typically window, yadda yadda
			//	|		// d	== document object
			//	|		// el == the generic element. a `has` element.
			//	|		return false; // fake test, byid-when-form-has-name-matching-an-id is slightly longer
			//	|	});

			(typeof cache[name]=="undefined" || force) && (cache[name]= test);
			return now && has(name);
		};

		// since we're operating under a loader that doesn't provide a has API, we must explicitly initialize
		// has as it would have otherwise been initialized by the dojo loader; use has.add to the builder
		// can optimize these away iff desired
		 1 || has.add("host-browser", isBrowser);
		 0 && has.add("host-node", (typeof process == "object" && process.versions && process.versions.node && process.versions.v8));
		 0 && has.add("host-rhino", (typeof load == "function" && (typeof Packages == "function" || typeof Packages == "object")));
		 1 || has.add("dom", isBrowser);
		 1 || has.add("dojo-dom-ready-api", 1);
		 0 && has.add("dojo-sniff", 1);
	}

	if( 1 ){
		// Common application level tests
		has.add("dom-addeventlistener", !!document.addEventListener);
		has.add("touch", "ontouchstart" in document || window.navigator.msMaxTouchPoints > 0);
		// I don't know if any of these tests are really correct, just a rough guess
		has.add("device-width", screen.availWidth || innerWidth);

		// Tests for DOMNode.attributes[] behavior:
		//	 - dom-attributes-explicit - attributes[] only lists explicitly user specified attributes
		//	 - dom-attributes-specified-flag (IE8) - need to check attr.specified flag to skip attributes user didn't specify
		//	 - Otherwise, in IE6-7. attributes[] will list hundreds of values, so need to do outerHTML to get attrs instead.
		var form = document.createElement("form");
		has.add("dom-attributes-explicit", form.attributes.length == 0); // W3C
		has.add("dom-attributes-specified-flag", form.attributes.length > 0 && form.attributes.length < 40);	// IE8
	}

	has.clearElement = function(element){
		// summary:
		//	 Deletes the contents of the element passed to test functions.
		element.innerHTML= "";
		return element;
	};

	has.normalize = function(id, toAbsMid){
		// summary:
		//	 Resolves id into a module id based on possibly-nested tenary expression that branches on has feature test value(s).
		//
		// toAbsMid: Function
		//	 Resolves a relative module id into an absolute module id
		var
			tokens = id.match(/[\?:]|[^:\?]*/g), i = 0,
			get = function(skip){
				var term = tokens[i++];
				if(term == ":"){
					// empty string module name, resolves to 0
					return 0;
				}else{
					// postfixed with a ? means it is a feature to branch on, the term is the name of the feature
					if(tokens[i++] == "?"){
						if(!skip && has(term)){
							// matched the feature, get the first value from the options
							return get();
						}else{
							// did not match, get the second value, passing over the first
							get(true);
							return get(skip);
						}
					}
					// a module
					return term || 0;
				}
			};
		id = get();
		return id && toAbsMid(id);
	};

	has.load = function(id, parentRequire, loaded){
		// summary:
		//		Conditional loading of AMD modules based on a has feature test value.
		// id: String
		//		Gives the resolved module id to load.
		// parentRequire: Function
		//		The loader require function with respect to the module that contained the plugin resource in it's
		//		dependency list.
		// loaded: Function
		//	 Callback to loader that consumes result of plugin demand.

		if(id){
			parentRequire([id], loaded);
		}else{
			loaded();
		}
	};

	return has;
});

},
'core/aspect':function(){
define([
	'./properties'
], function (properties) {
	'use strict';

	// module:
	//		dojo/aspect

	var undefined,
		getDescriptor = properties.getDescriptor,
		defineProperty = Object.defineProperty,
		nextId = 0;

	function advise(dispatcher, type, advice, receiveArguments) {
		var previous = dispatcher[type];
		var around = type === 'around';
		var signal;
		if (around) {
			var advised = advice(function () {
				return previous.advice(this, arguments);
			});
			signal = {
				remove: function () {
					signal.cancelled = true;
				},
				advice: function (target, args) {
					return signal.cancelled ?
						previous.advice(target, args) : // cancelled, skip to next one
						advised.apply(target, args);	// called the advised function
				}
			};
		}
		else {
			// create the remove handler
			signal = {
				remove: function () {
					var previous = signal.previous;
					var next = signal.next;
					if (!next && !previous) {
						delete dispatcher[type];
					}
					else {
						if (previous) {
							previous.next = next;
						}
						else {
							dispatcher[type] = next;
						}
						if (next) {
							next.previous = previous;
						}
					}
				},
				id: nextId++,
				advice: advice,
				receiveArguments: receiveArguments
			};
		}
		if (previous && !around) {
			if (type === 'after') {
				// add the listener to the end of the list
				// note that we had to change this loop a little bit to workaround a bizarre IE10 JIT bug
				while (previous.next && (previous = previous.next)) {}
				previous.next = signal;
				signal.previous = previous;
			}
			else if (type === 'before') {
				// add to beginning
				dispatcher[type] = signal;
				signal.next = previous;
				previous.previous = signal;
			}
		}
		else {
			// around or first one just replaces
			dispatcher[type] = signal;
		}
		return signal;
	}
	function aspect(type) {
		return function (target, methodName, advice, receiveArguments) {
			var existing = target[methodName],
				descriptor = getDescriptor(target, methodName),
				dispatcher;
			if (!existing || existing.target !== target) {
				// no dispatcher in place
				defineProperty(target, methodName, {
					value: (dispatcher = function () {
						var executionId = nextId;
						// before advice
						var args = arguments;
						var before = dispatcher.before;
						while (before) {
							args = before.advice.apply(this, args) || args;
							before = before.next;
						}
						// around advice
						if (dispatcher.around) {
							var results = dispatcher.around.advice(this, args);
						}
						// after advice
						var after = dispatcher.after;
						while (after && after.id < executionId) {
							if (after.receiveArguments) {
								var newResults = after.advice.apply(this, args);
								// change the return value only if a new value was returned
								results = newResults === undefined ? results : newResults;
							}
							else {
								results = after.advice.call(this, results, args);
							}
							after = after.next;
						}
						return results;
					}),
					writable: true,
					enumerable: descriptor ? descriptor.enumerable : true,
					configurable: true
				});
				if (existing) {
					dispatcher.around = { advice: function (target, args) {
						return existing.apply(target, args);
					}};
				}
				dispatcher.target = target;
			}
			var results = advise((dispatcher || existing), type, advice, receiveArguments);
			advice = null;
			return results;
		};
	}

	// TODOC: after/before/around return object

	var after = aspect('after');
	/*=====
	after = function(target, methodName, advice, receiveArguments) {
		// summary:
		//		The 'after' export of the aspect module is a function that can be used to attach
		//		'after' advice to a method. This function will be executed after the original method
		//		is executed. By default the function will be called with a single argument, the return
		//		value of the original method, or the the return value of the last executed advice (if a previous one exists).
		//		The fourth (optional) argument can be set to true to so the function receives the original
		//		arguments (from when the original method was called) rather than the return value.
		//		If there are multiple 'after' advisors, they are executed in the order they were registered.
		// target: Object
		//		This is the target object
		// methodName: String
		//		This is the name of the method to attach to.
		// advice: Function
		//		This is function to be called after the original method
		// receiveArguments: Boolean?
		//		If this is set to true, the advice function receives the original arguments (from when the original mehtod
		//		was called) rather than the return value of the original/previous method.
		// returns:
		//		A signal object that can be used to cancel the advice. If remove() is called on this signal object, it will
		//		stop the advice function from being executed.
	};
	=====*/

	var before = aspect('before');
	/*=====
	before = function(target, methodName, advice) {
		// summary:
		//		The 'before' export of the aspect module is a function that can be used to attach
		//		'before' advice to a method. This function will be executed before the original method
		//		is executed. This function will be called with the arguments used to call the method.
		//		This function may optionally return an array as the new arguments to use to call
		//		the original method (or the previous, next-to-execute before advice, if one exists).
		//		If the before method doesn't return anything (returns undefined) the original arguments
		//		will be preserved.
		//		If there are multiple 'before' advisors, they are executed in the reverse order they were registered.
		// target: Object
		//		This is the target object
		// methodName: String
		//		This is the name of the method to attach to.
		// advice: Function
		//		This is function to be called before the original method
	};
	=====*/

	var around = aspect('around');
	/*=====
	 around = function(target, methodName, advice) {
		// summary:
		//		The 'around' export of the aspect module is a function that can be used to attach
		//		'around' advice to a method. The advisor function is immediately executed when
		//		the around() is called, is passed a single argument that is a function that can be
		//		called to continue execution of the original method (or the next around advisor).
		//		The advisor function should return a function, and this function will be called whenever
		//		the method is called. It will be called with the arguments used to call the method.
		//		Whatever this function returns will be returned as the result of the method call (unless after advise changes it).
		// example:
		//		If there are multiple 'around' advisors, the most recent one is executed first,
		//		which can then delegate to the next one and so on. For example:
		//		|	around(obj, 'foo', function(originalFoo) {
		//		|		return function() {
		//		|			var start = new Date().getTime();
		//		|			var results = originalFoo.apply(this, arguments); // call the original
		//		|			var end = new Date().getTime();
		//		|			console.log('foo execution took ' + (end - start) + ' ms');
		//		|			return results;
		//		|		};
		//		|	});
		// target: Object
		//		This is the target object
		// methodName: String
		//		This is the name of the method to attach to.
		// advice: Function
		//		This is function to be called around the original method
	};
	=====*/

	return {
		// summary:
		//		provides aspect oriented programming functionality, allowing for
		//		one to add before, around, or after advice on existing methods.
		// example:
		//	|	define(['dojo/aspect'], function(aspect) {
		//	|		var signal = aspect.after(targetObject, 'methodName', function(someArgument) {
		//	|			this will be called when targetObject.methodName() is called, after the original function is called
		//	|		});
		//
		// example:
		//	The returned signal object can be used to cancel the advice.
		//	|	signal.remove(); // this will stop the advice from being executed anymore
		//	|	aspect.before(targetObject, 'methodName', function(someArgument) {
		//	|		// this will be called when targetObject.methodName() is called, before the original function is called
		//	|	 });

		before: before,
		around: around,
		after: after
	};
});
}}});
(function(){
	// must use this.require to make this work in node.js
	var require = this.require;
	// consume the cached dojo layer
	require({cache:{}});
	!require.async && require(["dojo"]);
	require.boot && require.apply(null, require.boot);
})();
