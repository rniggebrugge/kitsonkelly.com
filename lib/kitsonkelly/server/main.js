//>>built

require({cache:{"dojo/node":function () {
    define("dojo/node", ["dojo/has"], function (has) {
        if (!has("host-node")) {
            throw new Error("node plugin failed to load because environment is not Node.js");
        }
        return {load:function (id, require, load) {
            if (!require.nodeRequire) {
                throw new Error("Cannot find native require function");
            }
            load(require.nodeRequire(id));
        }};
    });
}, "dojo/has":function () {
    define("dojo/has", ["require", "module"], function (require, module) {
        var has = require.has || function () {
        };
        if (!1) {
            var isBrowser = typeof window != "undefined" && typeof location != "undefined" && typeof document != "undefined" && window.location == location && window.document == document, global = this, doc = isBrowser && document, element = doc && doc.createElement("DiV"), cache = (module.config && module.config()) || {};
            has = function (name) {
                return typeof cache[name] == "function" ? (cache[name] = cache[name](global, doc, element)) : cache[name];
            };
            has.cache = cache;
            has.add = function (name, test, now, force) {
                (typeof cache[name] == "undefined" || force) && (cache[name] = test);
                return now && has(name);
            };
            has.add("host-browser", isBrowser);
            has.add("dom", isBrowser);
            1 || has.add("dojo-dom-ready-api", 1);
            has.add("dojo-sniff", 1);
        }
        if (has("host-browser")) {
            has.add("dom-addeventlistener", !!document.addEventListener);
            has.add("touch", "ontouchstart" in document);
            has.add("device-width", screen.availWidth || innerWidth);
            var form = document.createElement("form");
            has.add("dom-attributes-explicit", form.attributes.length == 0);
            has.add("dom-attributes-specified-flag", form.attributes.length > 0 && form.attributes.length < 40);
        }
        has.clearElement = function (element) {
            element.innerHTML = "";
            return element;
        };
        has.normalize = function (id, toAbsMid) {
            var tokens = id.match(/[\?:]|[^:\?]*/g), i = 0, get = function (skip) {
                var term = tokens[i++];
                if (term == ":") {
                    return 0;
                } else {
                    if (tokens[i++] == "?") {
                        if (!skip && has(term)) {
                            return get();
                        } else {
                            get(true);
                            return get(skip);
                        }
                    }
                    return term || 0;
                }
            };
            id = get();
            return id && toAbsMid(id);
        };
        has.load = function (id, parentRequire, loaded) {
            if (id) {
                parentRequire([id], loaded);
            } else {
                loaded();
            }
        };
        return has;
    });
}, "dojo/Deferred":function () {
    define("dojo/Deferred", ["./has", "./_base/lang", "./errors/CancelError", "./promise/Promise", "./promise/instrumentation"], function (has, lang, CancelError, Promise, instrumentation) {
        "use strict";
        var PROGRESS = 0, RESOLVED = 1, REJECTED = 2;
        var FULFILLED_ERROR_MESSAGE = "This deferred has already been fulfilled.";
        var freezeObject = Object.freeze || function () {
        };
        var signalWaiting = function (waiting, type, result, rejection, deferred) {
            if (1) {
                if (type === REJECTED && Deferred.instrumentRejected && waiting.length === 0) {
                    Deferred.instrumentRejected(result, false, rejection, deferred);
                }
            }
            for (var i = 0; i < waiting.length; i++) {
                signalListener(waiting[i], type, result, rejection);
            }
        };
        var signalListener = function (listener, type, result, rejection) {
            var func = listener[type];
            var deferred = listener.deferred;
            if (func) {
                try {
                    var newResult = func(result);
                    if (newResult && typeof newResult.then === "function") {
                        listener.cancel = newResult.cancel;
                        newResult.then(makeDeferredSignaler(deferred, RESOLVED), makeDeferredSignaler(deferred, REJECTED), makeDeferredSignaler(deferred, PROGRESS));
                        return;
                    }
                    signalDeferred(deferred, RESOLVED, newResult);
                }
                catch (error) {
                    signalDeferred(deferred, REJECTED, error);
                }
            } else {
                signalDeferred(deferred, type, result);
            }
            if (1) {
                if (type === REJECTED && Deferred.instrumentRejected) {
                    Deferred.instrumentRejected(result, !!func, rejection, deferred.promise);
                }
            }
        };
        var makeDeferredSignaler = function (deferred, type) {
            return function (value) {
                signalDeferred(deferred, type, value);
            };
        };
        var signalDeferred = function (deferred, type, result) {
            if (!deferred.isCanceled()) {
                switch (type) {
                  case PROGRESS:
                    deferred.progress(result);
                    break;
                  case RESOLVED:
                    deferred.resolve(result);
                    break;
                  case REJECTED:
                    deferred.reject(result);
                    break;
                }
            }
        };
        var Deferred = function (canceler) {
            var promise = this.promise = new Promise();
            var deferred = this;
            var fulfilled, result, rejection;
            var canceled = false;
            var waiting = [];
            if (1 && Error.captureStackTrace) {
                Error.captureStackTrace(deferred, Deferred);
                Error.captureStackTrace(promise, Deferred);
            }
            this.isResolved = promise.isResolved = function () {
                return fulfilled === RESOLVED;
            };
            this.isRejected = promise.isRejected = function () {
                return fulfilled === REJECTED;
            };
            this.isFulfilled = promise.isFulfilled = function () {
                return !!fulfilled;
            };
            this.isCanceled = promise.isCanceled = function () {
                return canceled;
            };
            this.progress = function (update, strict) {
                if (!fulfilled) {
                    signalWaiting(waiting, PROGRESS, update, null, deferred);
                    return promise;
                } else {
                    if (strict === true) {
                        throw new Error(FULFILLED_ERROR_MESSAGE);
                    } else {
                        return promise;
                    }
                }
            };
            this.resolve = function (value, strict) {
                if (!fulfilled) {
                    signalWaiting(waiting, fulfilled = RESOLVED, result = value, null, deferred);
                    waiting = null;
                    return promise;
                } else {
                    if (strict === true) {
                        throw new Error(FULFILLED_ERROR_MESSAGE);
                    } else {
                        return promise;
                    }
                }
            };
            var reject = this.reject = function (error, strict) {
                if (!fulfilled) {
                    if (1 && Error.captureStackTrace) {
                        Error.captureStackTrace(rejection = {}, reject);
                    }
                    signalWaiting(waiting, fulfilled = REJECTED, result = error, rejection, deferred);
                    waiting = null;
                    return promise;
                } else {
                    if (strict === true) {
                        throw new Error(FULFILLED_ERROR_MESSAGE);
                    } else {
                        return promise;
                    }
                }
            };
            this.then = promise.then = function (callback, errback, progback) {
                var listener = [progback, callback, errback];
                listener.cancel = promise.cancel;
                listener.deferred = new Deferred(function (reason) {
                    return listener.cancel && listener.cancel(reason);
                });
                if (fulfilled && !waiting) {
                    signalListener(listener, fulfilled, result, rejection);
                } else {
                    waiting.push(listener);
                }
                return listener.deferred.promise;
            };
            this.cancel = promise.cancel = function (reason, strict) {
                if (!fulfilled) {
                    if (canceler) {
                        var returnedReason = canceler(reason);
                        reason = typeof returnedReason === "undefined" ? reason : returnedReason;
                    }
                    canceled = true;
                    if (!fulfilled) {
                        if (typeof reason === "undefined") {
                            reason = new CancelError();
                        }
                        reject(reason);
                        return reason;
                    } else {
                        if (fulfilled === REJECTED && result === reason) {
                            return reason;
                        }
                    }
                } else {
                    if (strict === true) {
                        throw new Error(FULFILLED_ERROR_MESSAGE);
                    }
                }
            };
            freezeObject(promise);
        };
        Deferred.prototype.toString = function () {
            return "[object Deferred]";
        };
        if (instrumentation) {
            instrumentation(Deferred);
        }
        return Deferred;
    });
}, "dojo/_base/lang":function () {
    define("dojo/_base/lang", ["./kernel", "../has", "../sniff"], function (dojo, has) {
        has.add("bug-for-in-skips-shadowed", function () {
            for (var i in {toString:1}) {
                return 0;
            }
            return 1;
        });
        var _extraNames = has("bug-for-in-skips-shadowed") ? "hasOwnProperty.valueOf.isPrototypeOf.propertyIsEnumerable.toLocaleString.toString.constructor".split(".") : [], _extraLen = _extraNames.length, getProp = function (parts, create, context) {
            var p, i = 0, dojoGlobal = dojo.global;
            if (!context) {
                if (!parts.length) {
                    return dojoGlobal;
                } else {
                    p = parts[i++];
                    try {
                        context = dojo.scopeMap[p] && dojo.scopeMap[p][1];
                    }
                    catch (e) {
                    }
                    context = context || (p in dojoGlobal ? dojoGlobal[p] : (create ? dojoGlobal[p] = {} : undefined));
                }
            }
            while (context && (p = parts[i++])) {
                context = (p in context ? context[p] : (create ? context[p] = {} : undefined));
            }
            return context;
        }, opts = Object.prototype.toString, efficient = function (obj, offset, startWith) {
            return (startWith || []).concat(Array.prototype.slice.call(obj, offset || 0));
        }, _pattern = /\{([^\}]+)\}/g;
        var lang = {_extraNames:_extraNames, _mixin:function (dest, source, copyFunc) {
            var name, s, i, empty = {};
            for (name in source) {
                s = source[name];
                if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
                    dest[name] = copyFunc ? copyFunc(s) : s;
                }
            }
            if (has("bug-for-in-skips-shadowed")) {
                if (source) {
                    for (i = 0; i < _extraLen; ++i) {
                        name = _extraNames[i];
                        s = source[name];
                        if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
                            dest[name] = copyFunc ? copyFunc(s) : s;
                        }
                    }
                }
            }
            return dest;
        }, mixin:function (dest, sources) {
            if (!dest) {
                dest = {};
            }
            for (var i = 1, l = arguments.length; i < l; i++) {
                lang._mixin(dest, arguments[i]);
            }
            return dest;
        }, setObject:function (name, value, context) {
            var parts = name.split("."), p = parts.pop(), obj = getProp(parts, true, context);
            return obj && p ? (obj[p] = value) : undefined;
        }, getObject:function (name, create, context) {
            return getProp(name.split("."), create, context);
        }, exists:function (name, obj) {
            return lang.getObject(name, false, obj) !== undefined;
        }, isString:function (it) {
            return (typeof it == "string" || it instanceof String);
        }, isArray:function (it) {
            return it && (it instanceof Array || typeof it == "array");
        }, isFunction:function (it) {
            return opts.call(it) === "[object Function]";
        }, isObject:function (it) {
            return it !== undefined && (it === null || typeof it == "object" || lang.isArray(it) || lang.isFunction(it));
        }, isArrayLike:function (it) {
            return it && it !== undefined && !lang.isString(it) && !lang.isFunction(it) && !(it.tagName && it.tagName.toLowerCase() == "form") && (lang.isArray(it) || isFinite(it.length));
        }, isAlien:function (it) {
            return it && !lang.isFunction(it) && /\{\s*\[native code\]\s*\}/.test(String(it));
        }, extend:function (ctor, props) {
            for (var i = 1, l = arguments.length; i < l; i++) {
                lang._mixin(ctor.prototype, arguments[i]);
            }
            return ctor;
        }, _hitchArgs:function (scope, method) {
            var pre = lang._toArray(arguments, 2);
            var named = lang.isString(method);
            return function () {
                var args = lang._toArray(arguments);
                var f = named ? (scope || dojo.global)[method] : method;
                return f && f.apply(scope || this, pre.concat(args));
            };
        }, hitch:function (scope, method) {
            if (arguments.length > 2) {
                return lang._hitchArgs.apply(dojo, arguments);
            }
            if (!method) {
                method = scope;
                scope = null;
            }
            if (lang.isString(method)) {
                scope = scope || dojo.global;
                if (!scope[method]) {
                    throw (["lang.hitch: scope[\"", method, "\"] is null (scope=\"", scope, "\")"].join(""));
                }
                return function () {
                    return scope[method].apply(scope, arguments || []);
                };
            }
            return !scope ? method : function () {
                return method.apply(scope, arguments || []);
            };
        }, delegate:(function () {
            function TMP() {
            }
            return function (obj, props) {
                TMP.prototype = obj;
                var tmp = new TMP();
                TMP.prototype = null;
                if (props) {
                    lang._mixin(tmp, props);
                }
                return tmp;
            };
        })(), _toArray:has("ie") ? (function () {
            function slow(obj, offset, startWith) {
                var arr = startWith || [];
                for (var x = offset || 0; x < obj.length; x++) {
                    arr.push(obj[x]);
                }
                return arr;
            }
            return function (obj) {
                return ((obj.item) ? slow : efficient).apply(this, arguments);
            };
        })() : efficient, partial:function (method) {
            var arr = [null];
            return lang.hitch.apply(dojo, arr.concat(lang._toArray(arguments)));
        }, clone:function (src) {
            if (!src || typeof src != "object" || lang.isFunction(src)) {
                return src;
            }
            if (src.nodeType && "cloneNode" in src) {
                return src.cloneNode(true);
            }
            if (src instanceof Date) {
                return new Date(src.getTime());
            }
            if (src instanceof RegExp) {
                return new RegExp(src);
            }
            var r, i, l;
            if (lang.isArray(src)) {
                r = [];
                for (i = 0, l = src.length; i < l; ++i) {
                    if (i in src) {
                        r.push(lang.clone(src[i]));
                    }
                }
            } else {
                r = src.constructor ? new src.constructor() : {};
            }
            return lang._mixin(r, src, lang.clone);
        }, trim:String.prototype.trim ? function (str) {
            return str.trim();
        } : function (str) {
            return str.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
        }, replace:function (tmpl, map, pattern) {
            return tmpl.replace(pattern || _pattern, lang.isFunction(map) ? map : function (_, k) {
                return lang.getObject(k, false, map);
            });
        }};
        1 && lang.mixin(dojo, lang);
        return lang;
    });
}, "dojo/_base/kernel":function () {
    define("dojo/_base/kernel", ["../has", "./config", "require", "module"], function (has, config, require, module) {
        var i, p, dijit = {}, dojox = {}, dojo = {config:config, global:this, dijit:dijit, dojox:dojox};
        var scopeMap = {dojo:["dojo", dojo], dijit:["dijit", dijit], dojox:["dojox", dojox]}, packageMap = (require.map && require.map[module.id.match(/[^\/]+/)[0]]), item;
        for (p in packageMap) {
            if (scopeMap[p]) {
                scopeMap[p][0] = packageMap[p];
            } else {
                scopeMap[p] = [packageMap[p], {}];
            }
        }
        for (p in scopeMap) {
            item = scopeMap[p];
            item[1]._scopeName = item[0];
            if (!config.noGlobals) {
                this[item[0]] = item[1];
            }
        }
        dojo.scopeMap = scopeMap;
        dojo.baseUrl = dojo.config.baseUrl = require.baseUrl;
        dojo.isAsync = !1 || require.async;
        dojo.locale = config.locale;
        var rev = "$Rev$".match(/\d+/);
        dojo.version = {major:1, minor:8, patch:0, flag:"dev", revision:rev ? +rev[0] : NaN, toString:function () {
            var v = dojo.version;
            return v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + ")";
        }};
        1 || has.add("extend-dojo", 1);
        (Function("d", "d.eval = function(){return d.global.eval ? d.global.eval(arguments[0]) : eval(arguments[0]);}"))(dojo);
        if (0) {
            dojo.exit = function (exitcode) {
                quit(exitcode);
            };
        } else {
            dojo.exit = function () {
            };
        }
        1 || has.add("dojo-guarantee-console", 1);
        if (1) {
            typeof console != "undefined" || (console = {});
            var cn = ["assert", "count", "debug", "dir", "dirxml", "error", "group", "groupEnd", "info", "profile", "profileEnd", "time", "timeEnd", "trace", "warn", "log"];
            var tn;
            i = 0;
            while ((tn = cn[i++])) {
                if (!console[tn]) {
                    (function () {
                        var tcn = tn + "";
                        console[tcn] = ("log" in console) ? function () {
                            var a = Array.apply({}, arguments);
                            a.unshift(tcn + ":");
                            console["log"](a.join(" "));
                        } : function () {
                        };
                        console[tcn]._fake = true;
                    })();
                }
            }
        }
        has.add("dojo-debug-messages", !!config.isDebug);
        dojo.deprecated = dojo.experimental = function () {
        };
        if (has("dojo-debug-messages")) {
            dojo.deprecated = function (behaviour, extra, removal) {
                var message = "DEPRECATED: " + behaviour;
                if (extra) {
                    message += " " + extra;
                }
                if (removal) {
                    message += " -- will be removed in version: " + removal;
                }
                console.warn(message);
            };
            dojo.experimental = function (moduleName, extra) {
                var message = "EXPERIMENTAL: " + moduleName + " -- APIs subject to change without notice.";
                if (extra) {
                    message += " " + extra;
                }
                console.warn(message);
            };
        }
        1 || has.add("dojo-modulePaths", 1);
        if (1) {
            if (config.modulePaths) {
                dojo.deprecated("dojo.modulePaths", "use paths configuration");
                var paths = {};
                for (p in config.modulePaths) {
                    paths[p.replace(/\./g, "/")] = config.modulePaths[p];
                }
                require({paths:paths});
            }
        }
        1 || has.add("dojo-moduleUrl", 1);
        if (1) {
            dojo.moduleUrl = function (module, url) {
                dojo.deprecated("dojo.moduleUrl()", "use require.toUrl", "2.0");
                var result = null;
                if (module) {
                    result = require.toUrl(module.replace(/\./g, "/") + (url ? ("/" + url) : "") + "/*.*").replace(/\/\*\.\*/, "") + (url ? "" : "/");
                }
                return result;
            };
        }
        dojo._hasResource = {};
        return dojo;
    });
}, "dojo/_base/config":function () {
    define("dojo/_base/config", ["../has", "require"], function (has, require) {
        var result = {};
        if (1) {
            var src = require.rawConfig, p;
            for (p in src) {
                result[p] = src[p];
            }
        } else {
            var adviseHas = function (featureSet, prefix, booting) {
                for (p in featureSet) {
                    p != "has" && has.add(prefix + p, featureSet[p], 0, booting);
                }
            };
            result = 1 ? require.rawConfig : this.dojoConfig || this.djConfig || {};
            adviseHas(result, "config", 1);
            adviseHas(result.has, "", 1);
        }
        return result;
    });
}, "dojo/sniff":function () {
    define("dojo/sniff", ["./has"], function (has) {
        if (has("host-browser")) {
            var n = navigator, dua = n.userAgent, dav = n.appVersion, tv = parseFloat(dav);
            has.add("air", dua.indexOf("AdobeAIR") >= 0), has.add("khtml", dav.indexOf("Konqueror") >= 0 ? tv : undefined);
            has.add("webkit", parseFloat(dua.split("WebKit/")[1]) || undefined);
            has.add("chrome", parseFloat(dua.split("Chrome/")[1]) || undefined);
            has.add("safari", dav.indexOf("Safari") >= 0 && !has("chrome") ? parseFloat(dav.split("Version/")[1]) : undefined);
            has.add("mac", dav.indexOf("Macintosh") >= 0);
            has.add("quirks", document.compatMode == "BackCompat");
            has.add("ios", /iPhone|iPod|iPad/.test(dua));
            has.add("android", parseFloat(dua.split("Android ")[1]) || undefined);
            if (!has("webkit")) {
                if (dua.indexOf("Opera") >= 0) {
                    has.add("opera", tv >= 9.8 ? parseFloat(dua.split("Version/")[1]) || tv : tv);
                }
                if (dua.indexOf("Gecko") >= 0 && !has("khtml") && !has("webkit")) {
                    has.add("mozilla", tv);
                }
                if (has("mozilla")) {
                    has.add("ff", parseFloat(dua.split("Firefox/")[1] || dua.split("Minefield/")[1]) || undefined);
                }
                if (document.all && !has("opera")) {
                    var isIE = parseFloat(dav.split("MSIE ")[1]) || undefined;
                    var mode = document.documentMode;
                    if (mode && mode != 5 && Math.floor(isIE) != mode) {
                        isIE = mode;
                    }
                    has.add("ie", isIE);
                }
                has.add("wii", typeof opera != "undefined" && opera.wiiremote);
            }
        }
        return has;
    });
}, "dojo/errors/CancelError":function () {
    define("dojo/errors/CancelError", ["./create"], function (create) {
        return create("CancelError", null, null, {dojoType:"cancel"});
    });
}, "dojo/errors/create":function () {
    define("dojo/errors/create", ["../_base/lang"], function (lang) {
        return function (name, ctor, base, props) {
            base = base || Error;
            var ErrorCtor = function (message) {
                if (base === Error) {
                    if (Error.captureStackTrace) {
                        Error.captureStackTrace(this, ErrorCtor);
                    }
                    var err = Error.call(this, message), prop;
                    for (prop in err) {
                        if (err.hasOwnProperty(prop)) {
                            this[prop] = err[prop];
                        }
                    }
                    this.message = message;
                } else {
                    base.apply(this, arguments);
                }
                if (ctor) {
                    ctor.apply(this, arguments);
                }
            };
            ErrorCtor.prototype = lang.delegate(base.prototype, props);
            ErrorCtor.prototype.name = name;
            ErrorCtor.prototype.constructor = ErrorCtor;
            return ErrorCtor;
        };
    });
}, "dojo/promise/Promise":function () {
    define("dojo/promise/Promise", ["../_base/lang"], function (lang) {
        "use strict";
        function throwAbstract() {
            throw new TypeError("abstract");
        }
        return lang.extend(function Promise() {
        }, {then:function (callback, errback, progback) {
            throwAbstract();
        }, cancel:function (reason, strict) {
            throwAbstract();
        }, isResolved:function () {
            throwAbstract();
        }, isRejected:function () {
            throwAbstract();
        }, isFulfilled:function () {
            throwAbstract();
        }, isCanceled:function () {
            throwAbstract();
        }, always:function (callbackOrErrback) {
            return this.then(callbackOrErrback, callbackOrErrback);
        }, otherwise:function (errback) {
            return this.then(null, errback);
        }, trace:function () {
            return this;
        }, traceRejected:function () {
            return this;
        }, toString:function () {
            return "[object Promise]";
        }});
    });
}, "dojo/promise/instrumentation":function () {
    define("dojo/promise/instrumentation", ["./tracer", "../has", "../_base/lang", "../_base/array"], function (tracer, has, lang, arrayUtil) {
        function logError(error, rejection, deferred) {
            var stack = "";
            if (error && error.stack) {
                stack += error.stack;
            }
            if (rejection && rejection.stack) {
                stack += "\n    ----------------------------------------\n    rejected" + rejection.stack.split("\n").slice(1).join("\n").replace(/^\s+/, " ");
            }
            if (deferred && deferred.stack) {
                stack += "\n    ----------------------------------------\n" + deferred.stack;
            }
            console.error(error, stack);
        }
        function reportRejections(error, handled, rejection, deferred) {
            if (!handled) {
                logError(error, rejection, deferred);
            }
        }
        var errors = [];
        var activeTimeout = false;
        var unhandledWait = 1000;
        function trackUnhandledRejections(error, handled, rejection, deferred) {
            if (handled) {
                arrayUtil.some(errors, function (obj, ix) {
                    if (obj.error === error) {
                        errors.splice(ix, 1);
                        return true;
                    }
                });
            } else {
                if (!arrayUtil.some(errors, function (obj) {
                    return obj.error === error;
                })) {
                    errors.push({error:error, rejection:rejection, deferred:deferred, timestamp:new Date().getTime()});
                }
            }
            if (!activeTimeout) {
                activeTimeout = setTimeout(logRejected, unhandledWait);
            }
        }
        function logRejected() {
            var now = new Date().getTime();
            var reportBefore = now - unhandledWait;
            errors = arrayUtil.filter(errors, function (obj) {
                if (obj.timestamp < reportBefore) {
                    logError(obj.error, obj.rejection, obj.deferred);
                    return false;
                }
                return true;
            });
            if (errors.length) {
                activeTimeout = setTimeout(logRejected, errors[0].timestamp + unhandledWait - now);
            }
        }
        return function (Deferred) {
            var usage = has("config-useDeferredInstrumentation");
            if (usage) {
                tracer.on("resolved", lang.hitch(console, "log", "resolved"));
                tracer.on("rejected", lang.hitch(console, "log", "rejected"));
                tracer.on("progress", lang.hitch(console, "log", "progress"));
                var args = [];
                if (typeof usage === "string") {
                    args = usage.split(",");
                    usage = args.shift();
                }
                if (usage === "report-rejections") {
                    Deferred.instrumentRejected = reportRejections;
                } else {
                    if (usage === "report-unhandled-rejections" || usage === true || usage === 1) {
                        Deferred.instrumentRejected = trackUnhandledRejections;
                        unhandledWait = parseInt(args[0], 10) || unhandledWait;
                    } else {
                        throw new Error("Unsupported instrumentation usage <" + usage + ">");
                    }
                }
            }
        };
    });
}, "dojo/promise/tracer":function () {
    define("dojo/promise/tracer", ["../_base/lang", "./Promise", "../Evented"], function (lang, Promise, Evented) {
        "use strict";
        var evented = new Evented;
        var emit = evented.emit;
        evented.emit = null;
        function emitAsync(args) {
            setTimeout(function () {
                emit.apply(evented, args);
            }, 0);
        }
        Promise.prototype.trace = function () {
            var args = lang._toArray(arguments);
            this.then(function (value) {
                emitAsync(["resolved", value].concat(args));
            }, function (error) {
                emitAsync(["rejected", error].concat(args));
            }, function (update) {
                emitAsync(["progress", update].concat(args));
            });
            return this;
        };
        Promise.prototype.traceRejected = function () {
            var args = lang._toArray(arguments);
            this.otherwise(function (error) {
                emitAsync(["rejected", error].concat(args));
            });
            return this;
        };
        return evented;
    });
}, "dojo/Evented":function () {
    define("dojo/Evented", ["./aspect", "./on"], function (aspect, on) {
        "use strict";
        var after = aspect.after;
        function Evented() {
        }
        Evented.prototype = {on:function (type, listener) {
            return on.parse(this, type, listener, function (target, type) {
                return after(target, "on" + type, listener, true);
            });
        }, emit:function (type, event) {
            var args = [this];
            args.push.apply(args, arguments);
            return on.emit.apply(on, args);
        }};
        return Evented;
    });
}, "dojo/aspect":function () {
    define("dojo/aspect", [], function () {
        "use strict";
        var undefined, nextId = 0;
        function advise(dispatcher, type, advice, receiveArguments) {
            var previous = dispatcher[type];
            var around = type == "around";
            var signal;
            if (around) {
                var advised = advice(function () {
                    return previous.advice(this, arguments);
                });
                signal = {remove:function () {
                    signal.cancelled = true;
                }, advice:function (target, args) {
                    return signal.cancelled ? previous.advice(target, args) : advised.apply(target, args);
                }};
            } else {
                signal = {remove:function () {
                    var previous = signal.previous;
                    var next = signal.next;
                    if (!next && !previous) {
                        delete dispatcher[type];
                    } else {
                        if (previous) {
                            previous.next = next;
                        } else {
                            dispatcher[type] = next;
                        }
                        if (next) {
                            next.previous = previous;
                        }
                    }
                }, id:nextId++, advice:advice, receiveArguments:receiveArguments};
            }
            if (previous && !around) {
                if (type == "after") {
                    var next = previous;
                    while (next) {
                        previous = next;
                        next = next.next;
                    }
                    previous.next = signal;
                    signal.previous = previous;
                } else {
                    if (type == "before") {
                        dispatcher[type] = signal;
                        signal.next = previous;
                        previous.previous = signal;
                    }
                }
            } else {
                dispatcher[type] = signal;
            }
            return signal;
        }
        function aspect(type) {
            return function (target, methodName, advice, receiveArguments) {
                var existing = target[methodName], dispatcher;
                if (!existing || existing.target != target) {
                    target[methodName] = dispatcher = function () {
                        var executionId = nextId;
                        var args = arguments;
                        var before = dispatcher.before;
                        while (before) {
                            args = before.advice.apply(this, args) || args;
                            before = before.next;
                        }
                        if (dispatcher.around) {
                            var results = dispatcher.around.advice(this, args);
                        }
                        var after = dispatcher.after;
                        while (after && after.id < executionId) {
                            if (after.receiveArguments) {
                                var newResults = after.advice.apply(this, args);
                                results = newResults === undefined ? results : newResults;
                            } else {
                                results = after.advice.call(this, results, args);
                            }
                            after = after.next;
                        }
                        return results;
                    };
                    if (existing) {
                        dispatcher.around = {advice:function (target, args) {
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
        var after = aspect("after");
        var before = aspect("before");
        var around = aspect("around");
        return {before:before, around:around, after:after};
    });
}, "dojo/on":function () {
    define("dojo/on", ["./has!dom-addeventlistener?:./aspect", "./_base/kernel", "./has"], function (aspect, dojo, has) {
        "use strict";
        if (has("dom")) {
            var major = window.ScriptEngineMajorVersion;
            has.add("jscript", major && (major() + ScriptEngineMinorVersion() / 10));
            has.add("event-orientationchange", has("touch") && !has("android"));
            has.add("event-stopimmediatepropagation", window.Event && !!window.Event.prototype && !!window.Event.prototype.stopImmediatePropagation);
        }
        var on = function (target, type, listener, dontFix) {
            if (target.on && typeof type != "function") {
                return target.on(type, listener);
            }
            return on.parse(target, type, listener, addListener, dontFix, this);
        };
        on.pausable = function (target, type, listener, dontFix) {
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
            var signal = on(target, type, function () {
                signal.remove();
                return listener.apply(this, arguments);
            });
            return signal;
        };
        on.parse = function (target, type, listener, addListener, dontFix, matchesTarget) {
            if (type.call) {
                return type.call(matchesTarget, target, listener);
            }
            if (type.indexOf(",") > -1) {
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
            var selector = type.match(/(.*):(.*)/);
            if (selector) {
                type = selector[2];
                selector = selector[1];
                return on.selector(selector, type).call(matchesTarget, target, listener);
            }
            if (has("touch")) {
                if (touchEvents.test(type)) {
                    listener = fixTouchListener(listener);
                }
                if (!has("event-orientationchange") && (type == "orientationchange")) {
                    type = "resize";
                    target = window;
                    listener = fixTouchListener(listener);
                }
            }
            if (addStopImmediate) {
                listener = addStopImmediate(listener);
            }
            if (target.addEventListener) {
                var capture = type in captures, adjustedType = capture ? captures[type] : type;
                target.addEventListener(adjustedType, listener, capture);
                return {remove:function () {
                    target.removeEventListener(adjustedType, listener, capture);
                }};
            }
            type = "on" + type;
            if (fixAttach && target.attachEvent) {
                return fixAttach(target, type, listener);
            }
            throw new Error("Target must be an event emitter");
        }
        on.selector = function (selector, eventType, children) {
            return function (target, listener) {
                var matchesTarget = typeof selector == "function" ? {matches:selector} : this, bubble = eventType.bubble;
                function select(eventTarget) {
                    matchesTarget = matchesTarget && matchesTarget.matches ? matchesTarget : dojo.query;
                    while (!matchesTarget.matches(eventTarget, selector, target)) {
                        if (eventTarget == target || children === false || !(eventTarget = eventTarget.parentNode) || eventTarget.nodeType != 1) {
                            return;
                        }
                    }
                    return eventTarget;
                }
                if (bubble) {
                    return on(target, bubble(select), listener);
                }
                return on(target, eventType, function (event) {
                    var eventTarget = select(event.target);
                    return eventTarget && listener.call(eventTarget, event);
                });
            };
        };
        function syntheticPreventDefault() {
            this.cancelable = false;
        }
        function syntheticStopPropagation() {
            this.bubbles = false;
        }
        var slice = [].slice, syntheticDispatch = on.emit = function (target, type, event) {
            var args = slice.call(arguments, 2);
            var method = "on" + type;
            if ("parentNode" in target) {
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
                target[method] && target[method].apply(target, args);
            } while (event && event.bubbles && (target = target.parentNode));
            return event && event.cancelable && event;
        };
        var captures = {};
        if (!has("event-stopimmediatepropagation")) {
            var stopImmediatePropagation = function () {
                this.immediatelyStopped = true;
                this.modified = true;
            };
            var addStopImmediate = function (listener) {
                return function (event) {
                    if (!event.immediatelyStopped) {
                        event.stopImmediatePropagation = stopImmediatePropagation;
                        return listener.apply(this, arguments);
                    }
                };
            };
        }
        if (has("dom-addeventlistener")) {
            captures = {focusin:"focus", focusout:"blur"};
            if (has("opera")) {
                captures.keydown = "keypress";
            }
            on.emit = function (target, type, event) {
                if (target.dispatchEvent && document.createEvent) {
                    var nativeEvent = target.ownerDocument.createEvent("HTMLEvents");
                    nativeEvent.initEvent(type, !!event.bubbles, !!event.cancelable);
                    for (var i in event) {
                        var value = event[i];
                        if (!(i in nativeEvent)) {
                            nativeEvent[i] = event[i];
                        }
                    }
                    return target.dispatchEvent(nativeEvent) && nativeEvent;
                }
                return syntheticDispatch.apply(on, arguments);
            };
        } else {
            on._fixEvent = function (evt, sender) {
                if (!evt) {
                    var w = sender && (sender.ownerDocument || sender.document || sender).parentWindow || window;
                    evt = w.event;
                }
                if (!evt) {
                    return evt;
                }
                if (lastEvent && evt.type == lastEvent.type) {
                    evt = lastEvent;
                }
                if (!evt.target) {
                    evt.target = evt.srcElement;
                    evt.currentTarget = (sender || evt.srcElement);
                    if (evt.type == "mouseover") {
                        evt.relatedTarget = evt.fromElement;
                    }
                    if (evt.type == "mouseout") {
                        evt.relatedTarget = evt.toElement;
                    }
                    if (!evt.stopPropagation) {
                        evt.stopPropagation = stopPropagation;
                        evt.preventDefault = preventDefault;
                    }
                    switch (evt.type) {
                      case "keypress":
                        var c = ("charCode" in evt ? evt.charCode : evt.keyCode);
                        if (c == 10) {
                            c = 0;
                            evt.keyCode = 13;
                        } else {
                            if (c == 13 || c == 27) {
                                c = 0;
                            } else {
                                if (c == 3) {
                                    c = 99;
                                }
                            }
                        }
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
                return function (evt) {
                    evt = on._fixEvent(evt, this);
                    var result = listener.call(this, evt);
                    if (evt.modified) {
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
                if (((target.ownerDocument ? target.ownerDocument.parentWindow : target.parentWindow || target.window || window) != top || has("jscript") < 5.8) && !has("config-_allow_leaks")) {
                    if (typeof _dojoIEListeners_ == "undefined") {
                        _dojoIEListeners_ = [];
                    }
                    var emiter = target[type];
                    if (!emiter || !emiter.listeners) {
                        var oldListener = emiter;
                        emiter = Function("event", "var callee = arguments.callee; for(var i = 0; i<callee.listeners.length; i++){var listener = _dojoIEListeners_[callee.listeners[i]]; if(listener){listener.call(this,event);}}");
                        emiter.listeners = [];
                        target[type] = emiter;
                        emiter.global = this;
                        if (oldListener) {
                            emiter.listeners.push(_dojoIEListeners_.push(oldListener) - 1);
                        }
                    }
                    var handle;
                    emiter.listeners.push(handle = (emiter.global._dojoIEListeners_.push(listener) - 1));
                    return new IESignal(handle);
                }
                return aspect.after(target, type, listener, true);
            };
            var _setKeyChar = function (evt) {
                evt.keyChar = evt.charCode ? String.fromCharCode(evt.charCode) : "";
                evt.charOrCode = evt.keyChar || evt.keyCode;
            };
            var stopPropagation = function () {
                this.cancelBubble = true;
            };
            var preventDefault = on._preventDefault = function () {
                this.bubbledKeyCode = this.keyCode;
                if (this.ctrlKey) {
                    try {
                        this.keyCode = 0;
                    }
                    catch (e) {
                    }
                }
                this.defaultPrevented = true;
                this.returnValue = false;
            };
        }
        if (has("touch")) {
            var Event = function () {
            };
            var windowOrientation = window.orientation;
            var fixTouchListener = function (listener) {
                return function (originalEvent) {
                    var event = originalEvent.corrected;
                    if (!event) {
                        var type = originalEvent.type;
                        try {
                            delete originalEvent.type;
                        }
                        catch (e) {
                        }
                        if (originalEvent.type) {
                            Event.prototype = originalEvent;
                            var event = new Event;
                            event.preventDefault = function () {
                                originalEvent.preventDefault();
                            };
                            event.stopPropagation = function () {
                                originalEvent.stopPropagation();
                            };
                        } else {
                            event = originalEvent;
                            event.type = type;
                        }
                        originalEvent.corrected = event;
                        if (type == "resize") {
                            if (windowOrientation == window.orientation) {
                                return null;
                            }
                            windowOrientation = window.orientation;
                            event.type = "orientationchange";
                            return listener.call(this, event);
                        }
                        if (!("rotation" in event)) {
                            event.rotation = 0;
                            event.scale = 1;
                        }
                        var firstChangeTouch = event.changedTouches[0];
                        for (var i in firstChangeTouch) {
                            delete event[i];
                            event[i] = firstChangeTouch[i];
                        }
                    }
                    return listener.call(this, event);
                };
            };
        }
        return on;
    });
}, "dojo/_base/array":function () {
    define("dojo/_base/array", ["./kernel", "../has", "./lang"], function (dojo, has, lang) {
        var cache = {}, u;
        function buildFn(fn) {
            return cache[fn] = new Function("item", "index", "array", fn);
        }
        function everyOrSome(some) {
            var every = !some;
            return function (a, fn, o) {
                var i = 0, l = a && a.length || 0, result;
                if (l && typeof a == "string") {
                    a = a.split("");
                }
                if (typeof fn == "string") {
                    fn = cache[fn] || buildFn(fn);
                }
                if (o) {
                    for (; i < l; ++i) {
                        result = !fn.call(o, a[i], i, a);
                        if (some ^ result) {
                            return !result;
                        }
                    }
                } else {
                    for (; i < l; ++i) {
                        result = !fn(a[i], i, a);
                        if (some ^ result) {
                            return !result;
                        }
                    }
                }
                return every;
            };
        }
        function index(up) {
            var delta = 1, lOver = 0, uOver = 0;
            if (!up) {
                delta = lOver = uOver = -1;
            }
            return function (a, x, from, last) {
                if (last && delta > 0) {
                    return array.lastIndexOf(a, x, from);
                }
                var l = a && a.length || 0, end = up ? l + uOver : lOver, i;
                if (from === u) {
                    i = up ? lOver : l + uOver;
                } else {
                    if (from < 0) {
                        i = l + from;
                        if (i < 0) {
                            i = lOver;
                        }
                    } else {
                        i = from >= l ? l + uOver : from;
                    }
                }
                if (l && typeof a == "string") {
                    a = a.split("");
                }
                for (; i != end; i += delta) {
                    if (a[i] == x) {
                        return i;
                    }
                }
                return -1;
            };
        }
        var array = {every:everyOrSome(false), some:everyOrSome(true), indexOf:index(true), lastIndexOf:index(false), forEach:function (arr, callback, thisObject) {
            var i = 0, l = arr && arr.length || 0;
            if (l && typeof arr == "string") {
                arr = arr.split("");
            }
            if (typeof callback == "string") {
                callback = cache[callback] || buildFn(callback);
            }
            if (thisObject) {
                for (; i < l; ++i) {
                    callback.call(thisObject, arr[i], i, arr);
                }
            } else {
                for (; i < l; ++i) {
                    callback(arr[i], i, arr);
                }
            }
        }, map:function (arr, callback, thisObject, Ctr) {
            var i = 0, l = arr && arr.length || 0, out = new (Ctr || Array)(l);
            if (l && typeof arr == "string") {
                arr = arr.split("");
            }
            if (typeof callback == "string") {
                callback = cache[callback] || buildFn(callback);
            }
            if (thisObject) {
                for (; i < l; ++i) {
                    out[i] = callback.call(thisObject, arr[i], i, arr);
                }
            } else {
                for (; i < l; ++i) {
                    out[i] = callback(arr[i], i, arr);
                }
            }
            return out;
        }, filter:function (arr, callback, thisObject) {
            var i = 0, l = arr && arr.length || 0, out = [], value;
            if (l && typeof arr == "string") {
                arr = arr.split("");
            }
            if (typeof callback == "string") {
                callback = cache[callback] || buildFn(callback);
            }
            if (thisObject) {
                for (; i < l; ++i) {
                    value = arr[i];
                    if (callback.call(thisObject, value, i, arr)) {
                        out.push(value);
                    }
                }
            } else {
                for (; i < l; ++i) {
                    value = arr[i];
                    if (callback(value, i, arr)) {
                        out.push(value);
                    }
                }
            }
            return out;
        }, clearCache:function () {
            cache = {};
        }};
        1 && lang.mixin(dojo, array);
        return array;
    });
}, "dojo/promise/all":function () {
    define("dojo/promise/all", ["../_base/array", "../Deferred", "../when"], function (array, Deferred, when) {
        "use strict";
        var some = array.some;
        return function all(objectOrArray) {
            var object, array;
            if (objectOrArray instanceof Array) {
                array = objectOrArray;
            } else {
                if (objectOrArray && typeof objectOrArray === "object") {
                    object = objectOrArray;
                }
            }
            var results;
            var keyLookup = [];
            if (object) {
                array = [];
                for (var key in object) {
                    if (Object.hasOwnProperty.call(object, key)) {
                        keyLookup.push(key);
                        array.push(object[key]);
                    }
                }
                results = {};
            } else {
                if (array) {
                    results = [];
                }
            }
            if (!array || !array.length) {
                return new Deferred().resolve(results);
            }
            var deferred = new Deferred();
            deferred.promise.always(function () {
                results = keyLookup = null;
            });
            var waiting = array.length;
            some(array, function (valueOrPromise, index) {
                if (!object) {
                    keyLookup.push(index);
                }
                when(valueOrPromise, function (value) {
                    if (!deferred.isFulfilled()) {
                        results[keyLookup[index]] = value;
                        if (--waiting === 0) {
                            deferred.resolve(results);
                        }
                    }
                }, deferred.reject);
                return deferred.isFulfilled();
            });
            return deferred.promise;
        };
    });
}, "dojo/when":function () {
    define("dojo/when", ["./Deferred", "./promise/Promise"], function (Deferred, Promise) {
        "use strict";
        return function when(valueOrPromise, callback, errback, progback) {
            var receivedPromise = valueOrPromise && typeof valueOrPromise.then === "function";
            var nativePromise = receivedPromise && valueOrPromise instanceof Promise;
            if (!receivedPromise) {
                if (callback) {
                    return callback(valueOrPromise);
                } else {
                    return new Deferred().resolve(valueOrPromise);
                }
            } else {
                if (!nativePromise) {
                    var deferred = new Deferred(valueOrPromise.cancel);
                    valueOrPromise.then(deferred.resolve, deferred.reject, deferred.progress);
                    valueOrPromise = deferred.promise;
                }
            }
            if (callback || errback || progback) {
                return valueOrPromise.then(callback, errback, progback);
            }
            return valueOrPromise;
        };
    });
}, "kitsonkelly/server/as":function () {
    define("kitsonkelly/server/as", ["dojo/Deferred", "dojo/request", "dojo/request/handlers", "dojo/node!xml2js"], function (Deferred, request, handlers, xml2js) {
        var server = "ws.audioscrobbler.com", method = "user.getrecenttracks", user = "kitsonk", apiKey = "b25b959554ed76058ac220b7b2e0a026";
        handlers.register("xml2js", function (response) {
            var parser = new xml2js.Parser(), d = new Deferred();
            parser.parseString(response.text, function (err, result) {
                if (err) {
                    d.reject(err);
                }
                d.resolve(result);
            });
            return d;
        });
        return function () {
            return request.get("http://" + server + "/2.0/?method=" + method + "&user=" + user + "&api_key=" + apiKey, {handleAs:"xml2js"}).then(function (result) {
                return result;
            });
        };
    });
}, "dojo/request":function () {
    define("dojo/request", ["./request/default!"], function (defaultTransport) {
        return defaultTransport;
    });
}, "dojo/request/default":function () {
    define("dojo/request/default", ["exports", "require", "../has"], function (exports, require, has) {
        var defId = has("config-requestProvider"), platformId;
        if (has("host-browser")) {
            platformId = "./xhr";
        } else {
            if (has("host-node")) {
                platformId = "./node";
            }
        }
        if (!defId) {
            defId = platformId;
        }
        exports.getPlatformDefaultId = function () {
            return platformId;
        };
        exports.load = function (id, parentRequire, loaded, config) {
            require([id == "platform" ? platformId : defId], function (provider) {
                loaded(provider);
            });
        };
    });
}, "dojo/request/handlers":function () {
    define("dojo/request/handlers", ["../json", "../_base/kernel", "../_base/array", "../has"], function (JSON, kernel, array, has) {
        has.add("activex", typeof ActiveXObject !== "undefined");
        var handleXML;
        if (has("activex")) {
            var dp = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML.DOMDocument"];
            handleXML = function (response) {
                var result = response.data;
                if (!result || !result.documentElement) {
                    var text = response.text;
                    array.some(dp, function (p) {
                        try {
                            var dom = new ActiveXObject(p);
                            dom.async = false;
                            dom.loadXML(text);
                            result = dom;
                        }
                        catch (e) {
                            return false;
                        }
                        return true;
                    });
                }
                return result;
            };
        }
        var handlers = {"javascript":function (response) {
            return kernel.eval(response.text || "");
        }, "json":function (response) {
            return JSON.parse(response.text || null);
        }, "xml":handleXML};
        function handle(response) {
            var handler = handlers[response.options.handleAs];
            response.data = handler ? handler(response) : (response.data || response.text);
            return response;
        }
        handle.register = function (name, handler) {
            handlers[name] = handler;
        };
        return handle;
    });
}, "dojo/json":function () {
    define("dojo/json", ["./has"], function (has) {
        "use strict";
        var hasJSON = typeof JSON != "undefined";
        has.add("json-parse", hasJSON);
        has.add("json-stringify", hasJSON && JSON.stringify({a:0}, function (k, v) {
            return v || 1;
        }) == "{\"a\":1}");
        if (has("json-stringify")) {
            return JSON;
        } else {
            var escapeString = function (str) {
                return ("\"" + str.replace(/(["\\])/g, "\\$1") + "\"").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
            };
            return {parse:has("json-parse") ? JSON.parse : function (str, strict) {
                if (strict && !/^([\s\[\{]*(?:"(?:\\.|[^"])+"|-?\d[\d\.]*(?:[Ee][+-]?\d+)?|null|true|false|)[\s\]\}]*(?:,|:|$))+$/.test(str)) {
                    throw new SyntaxError("Invalid characters in JSON");
                }
                return eval("(" + str + ")");
            }, stringify:function (value, replacer, spacer) {
                var undef;
                if (typeof replacer == "string") {
                    spacer = replacer;
                    replacer = null;
                }
                function stringify(it, indent, key) {
                    if (replacer) {
                        it = replacer(key, it);
                    }
                    var val, objtype = typeof it;
                    if (objtype == "number") {
                        return isFinite(it) ? it + "" : "null";
                    }
                    if (objtype == "boolean") {
                        return it + "";
                    }
                    if (it === null) {
                        return "null";
                    }
                    if (typeof it == "string") {
                        return escapeString(it);
                    }
                    if (objtype == "function" || objtype == "undefined") {
                        return undef;
                    }
                    if (typeof it.toJSON == "function") {
                        return stringify(it.toJSON(key), indent, key);
                    }
                    if (it instanceof Date) {
                        return "\"{FullYear}-{Month+}-{Date}T{Hours}:{Minutes}:{Seconds}Z\"".replace(/\{(\w+)(\+)?\}/g, function (t, prop, plus) {
                            var num = it["getUTC" + prop]() + (plus ? 1 : 0);
                            return num < 10 ? "0" + num : num;
                        });
                    }
                    if (it.valueOf() !== it) {
                        return stringify(it.valueOf(), indent, key);
                    }
                    var nextIndent = spacer ? (indent + spacer) : "";
                    var sep = spacer ? " " : "";
                    var newLine = spacer ? "\n" : "";
                    if (it instanceof Array) {
                        var itl = it.length, res = [];
                        for (key = 0; key < itl; key++) {
                            var obj = it[key];
                            val = stringify(obj, nextIndent, key);
                            if (typeof val != "string") {
                                val = "null";
                            }
                            res.push(newLine + nextIndent + val);
                        }
                        return "[" + res.join(",") + newLine + indent + "]";
                    }
                    var output = [];
                    for (key in it) {
                        var keyStr;
                        if (it.hasOwnProperty(key)) {
                            if (typeof key == "number") {
                                keyStr = "\"" + key + "\"";
                            } else {
                                if (typeof key == "string") {
                                    keyStr = escapeString(key);
                                } else {
                                    continue;
                                }
                            }
                            val = stringify(it[key], nextIndent, key);
                            if (typeof val != "string") {
                                continue;
                            }
                            output.push(newLine + nextIndent + keyStr + ":" + sep + val);
                        }
                    }
                    return "{" + output.join(",") + newLine + indent + "}";
                }
                return stringify(value, "", "");
            }};
        }
    });
}}});
require(["dojo/node!util", "dojo/node!express", "dojo/node!jade", "dojo/Deferred", "dojo/promise/all", "kitsonkelly/server/as"], function (util, express, jade, Deferred, all, as) {
    var app = express.createServer(), appPort = process.env.PORT || 8001;
    function NotFound(msg) {
        this.name = "Not Found";
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    }
    NotFound.prototype.__proto__ = Error.prototype;
    app.configure(function () {
        app.set("view options", {layout:false});
        app.set("view engine", "jade");
        app.use(express.favicon("./images/favicon.ico"));
        app.use(express.cookieParser());
        app.use(express.session({secret:"yHCoyEPZ9WsNDORGb9SDDMNn0OOMcCgQiW5q8VFhDHJiztvvVVCPkZQWUAXl"}));
        app.use(app.router);
        app.use("/lib", express["static"]("./src"));
        app.use("/css", express["static"]("./css"));
        app.use("/images", express["static"]("./images"));
        app.use("/static", express["static"]("./static"));
        app.use(function (request, response, next) {
            if (request.accepts("html")) {
                response.status(404);
                response.render("404", {url:request.url});
                return;
            }
            if (request.accepts("json")) {
                response.send({error:"Not Found"});
                return;
            }
            response.type("txt").send("Not Found");
        });
        app.use(function (error, request, response, next) {
            response.status(error.status || 500);
            response.render("500", {error:error});
        });
    });
    app.get("/", function (request, response, next) {
        response.render("index");
    });
    app.get("/cv", function (request, response, next) {
        response.render("cv");
    });
    app.get("/dojo", function (request, response, next) {
        response.render("dojo");
    });
    app.get("/content/:view", function (request, response, next) {
        response.render("content/" + request.params.view);
    });
    app.get("/page/:page", function (request, response, next) {
        var d = new Deferred();
        jade.renderFile("views/content/" + request.params.page + ".jade", {}, function (err, page) {
            if (err) {
                d.reject(err);
            } else {
                d.resolve(page);
            }
        });
        if (request.params.page == "cv") {
            var d2 = new Deferred();
            jade.renderFile("views/content/cv_nav.jade", {}, function (err, page) {
                if (err) {
                    d2.reject(err);
                } else {
                    d2.resolve(page);
                }
            });
            d = all([d, d2]);
        }
        d.then(function (page) {
            var result = {title:"Kitson P. Kelly"};
            if (page instanceof Array) {
                result.content = page[0];
                result.nav = page[1];
            } else {
                result.content = page;
            }
            switch (request.params.page) {
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
                result.subtitle = "curriculum vitae/r\xe9sum\xe9";
            }
            response.json(result);
        }, function (err) {
            next(err);
        });
    });
    app.get("/views/:view", function (request, response, next) {
        response.render(request.params.view);
    });
    app.get("/lastfm", function (request, response, next) {
        as().then(function (reply) {
            response.json(reply);
        }, function (err) {
            next(err);
        });
    });
    app.get("/404", function (request, response, next) {
        next();
    });
    app.get("/403", function (request, response, next) {
        var error = new Error("not allowed!");
        error.status = 403;
        next(error);
    });
    app.get("/500", function (request, response, next) {
        next(new Error("All your base are belong to us!"));
    });
    app.listen(appPort);
    util.puts("HTTP server started on port " + appPort);
});

