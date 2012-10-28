//>>built

require({cache:{"dojo/_base/array":function () {
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
}, "dojo/dom":function () {
    define("dojo/dom", ["./sniff", "./_base/lang", "./_base/window"], function (has, lang, win) {
        if (has("ie") <= 7) {
            try {
                document.execCommand("BackgroundImageCache", false, true);
            }
            catch (e) {
            }
        }
        var dom = {};
        if (has("ie")) {
            dom.byId = function (id, doc) {
                if (typeof id != "string") {
                    return id;
                }
                var _d = doc || win.doc, te = id && _d.getElementById(id);
                if (te && (te.attributes.id.value == id || te.id == id)) {
                    return te;
                } else {
                    var eles = _d.all[id];
                    if (!eles || eles.nodeName) {
                        eles = [eles];
                    }
                    var i = 0;
                    while ((te = eles[i++])) {
                        if ((te.attributes && te.attributes.id && te.attributes.id.value == id) || te.id == id) {
                            return te;
                        }
                    }
                }
            };
        } else {
            dom.byId = function (id, doc) {
                return ((typeof id == "string") ? (doc || win.doc).getElementById(id) : id) || null;
            };
        }
        dom.isDescendant = function (node, ancestor) {
            try {
                node = dom.byId(node);
                ancestor = dom.byId(ancestor);
                while (node) {
                    if (node == ancestor) {
                        return true;
                    }
                    node = node.parentNode;
                }
            }
            catch (e) {
            }
            return false;
        };
        dom.setSelectable = function (node, selectable) {
            node = dom.byId(node);
            if (has("mozilla")) {
                node.style.MozUserSelect = selectable ? "" : "none";
            } else {
                if (has("khtml") || has("webkit")) {
                    node.style.KhtmlUserSelect = selectable ? "auto" : "none";
                } else {
                    if (has("ie")) {
                        var v = (node.unselectable = selectable ? "" : "on"), cs = node.getElementsByTagName("*"), i = 0, l = cs.length;
                        for (; i < l; ++i) {
                            cs.item(i).unselectable = v;
                        }
                    }
                }
            }
        };
        return dom;
    });
}, "dojo/_base/window":function () {
    define("dojo/_base/window", ["./kernel", "./lang", "../sniff"], function (dojo, lang, has) {
        var ret = {global:dojo.global, doc:this["document"] || null, body:function (doc) {
            doc = doc || dojo.doc;
            return doc.body || doc.getElementsByTagName("body")[0];
        }, setContext:function (globalObject, globalDocument) {
            dojo.global = ret.global = globalObject;
            dojo.doc = ret.doc = globalDocument;
        }, withGlobal:function (globalObject, callback, thisObject, cbArguments) {
            var oldGlob = dojo.global;
            try {
                dojo.global = ret.global = globalObject;
                return ret.withDoc.call(null, globalObject.document, callback, thisObject, cbArguments);
            }
            finally {
                dojo.global = ret.global = oldGlob;
            }
        }, withDoc:function (documentObject, callback, thisObject, cbArguments) {
            var oldDoc = ret.doc, oldQ = has("quirks"), oldIE = has("ie"), isIE, mode, pwin;
            try {
                dojo.doc = ret.doc = documentObject;
                dojo.isQuirks = has.add("quirks", dojo.doc.compatMode == "BackCompat", true, true);
                if (has("ie")) {
                    if ((pwin = documentObject.parentWindow) && pwin.navigator) {
                        isIE = parseFloat(pwin.navigator.appVersion.split("MSIE ")[1]) || undefined;
                        mode = documentObject.documentMode;
                        if (mode && mode != 5 && Math.floor(isIE) != mode) {
                            isIE = mode;
                        }
                        dojo.isIE = has.add("ie", isIE, true, true);
                    }
                }
                if (thisObject && typeof callback == "string") {
                    callback = thisObject[callback];
                }
                return callback.apply(thisObject, cbArguments || []);
            }
            finally {
                dojo.doc = ret.doc = oldDoc;
                dojo.isQuirks = has.add("quirks", oldQ, true, true);
                dojo.isIE = has.add("ie", oldIE, true, true);
            }
        }};
        1 && lang.mixin(dojo, ret);
        return ret;
    });
}, "dojo/dom-construct":function () {
    define("dojo/dom-construct", ["exports", "./_base/kernel", "./sniff", "./_base/window", "./dom", "./dom-attr", "./on"], function (exports, dojo, has, win, dom, attr, on) {
        var tagWrap = {option:["select"], tbody:["table"], thead:["table"], tfoot:["table"], tr:["table", "tbody"], td:["table", "tbody", "tr"], th:["table", "thead", "tr"], legend:["fieldset"], caption:["table"], colgroup:["table"], col:["table", "colgroup"], li:["ul"]}, reTag = /<\s*([\w\:]+)/, masterNode = {}, masterNum = 0, masterName = "__" + dojo._scopeName + "ToDomId";
        for (var param in tagWrap) {
            if (tagWrap.hasOwnProperty(param)) {
                var tw = tagWrap[param];
                tw.pre = param == "option" ? "<select multiple=\"multiple\">" : "<" + tw.join("><") + ">";
                tw.post = "</" + tw.reverse().join("></") + ">";
            }
        }
        function _insertBefore(node, ref) {
            var parent = ref.parentNode;
            if (parent) {
                parent.insertBefore(node, ref);
            }
        }
        function _insertAfter(node, ref) {
            var parent = ref.parentNode;
            if (parent) {
                if (parent.lastChild == ref) {
                    parent.appendChild(node);
                } else {
                    parent.insertBefore(node, ref.nextSibling);
                }
            }
        }
        var _destroyContainer = null, _destroyDoc;
        on(window, "unload", function () {
            _destroyContainer = null;
        });
        exports.toDom = function toDom(frag, doc) {
            doc = doc || win.doc;
            var masterId = doc[masterName];
            if (!masterId) {
                doc[masterName] = masterId = ++masterNum + "";
                masterNode[masterId] = doc.createElement("div");
            }
            frag += "";
            var match = frag.match(reTag), tag = match ? match[1].toLowerCase() : "", master = masterNode[masterId], wrap, i, fc, df;
            if (match && tagWrap[tag]) {
                wrap = tagWrap[tag];
                master.innerHTML = wrap.pre + frag + wrap.post;
                for (i = wrap.length; i; --i) {
                    master = master.firstChild;
                }
            } else {
                master.innerHTML = frag;
            }
            if (master.childNodes.length == 1) {
                return master.removeChild(master.firstChild);
            }
            df = doc.createDocumentFragment();
            while (fc = master.firstChild) {
                df.appendChild(fc);
            }
            return df;
        };
        exports.place = function place(node, refNode, position) {
            refNode = dom.byId(refNode);
            if (typeof node == "string") {
                node = /^\s*</.test(node) ? exports.toDom(node, refNode.ownerDocument) : dom.byId(node);
            }
            if (typeof position == "number") {
                var cn = refNode.childNodes;
                if (!cn.length || cn.length <= position) {
                    refNode.appendChild(node);
                } else {
                    _insertBefore(node, cn[position < 0 ? 0 : position]);
                }
            } else {
                switch (position) {
                  case "before":
                    _insertBefore(node, refNode);
                    break;
                  case "after":
                    _insertAfter(node, refNode);
                    break;
                  case "replace":
                    refNode.parentNode.replaceChild(node, refNode);
                    break;
                  case "only":
                    exports.empty(refNode);
                    refNode.appendChild(node);
                    break;
                  case "first":
                    if (refNode.firstChild) {
                        _insertBefore(node, refNode.firstChild);
                        break;
                    }
                  default:
                    refNode.appendChild(node);
                }
            }
            return node;
        };
        exports.create = function create(tag, attrs, refNode, pos) {
            var doc = win.doc;
            if (refNode) {
                refNode = dom.byId(refNode);
                doc = refNode.ownerDocument;
            }
            if (typeof tag == "string") {
                tag = doc.createElement(tag);
            }
            if (attrs) {
                attr.set(tag, attrs);
            }
            if (refNode) {
                exports.place(tag, refNode, pos);
            }
            return tag;
        };
        exports.empty = has("ie") ? function (node) {
            node = dom.byId(node);
            for (var c; c = node.lastChild; ) {
                exports.destroy(c);
            }
        } : function (node) {
            dom.byId(node).innerHTML = "";
        };
        exports.destroy = function destroy(node) {
            node = dom.byId(node);
            try {
                var doc = node.ownerDocument;
                if (!_destroyContainer || _destroyDoc != doc) {
                    _destroyContainer = doc.createElement("div");
                    _destroyDoc = doc;
                }
                _destroyContainer.appendChild(node.parentNode ? node.parentNode.removeChild(node) : node);
                _destroyContainer.innerHTML = "";
            }
            catch (e) {
            }
        };
    });
}, "dojo/dom-attr":function () {
    define("dojo/dom-attr", ["exports", "./sniff", "./_base/lang", "./dom", "./dom-style", "./dom-prop"], function (exports, has, lang, dom, style, prop) {
        var forcePropNames = {innerHTML:1, className:1, htmlFor:has("ie"), value:1}, attrNames = {classname:"class", htmlfor:"for", tabindex:"tabIndex", readonly:"readOnly"};
        function _hasAttr(node, name) {
            var attr = node.getAttributeNode && node.getAttributeNode(name);
            return attr && attr.specified;
        }
        exports.has = function hasAttr(node, name) {
            var lc = name.toLowerCase();
            return forcePropNames[prop.names[lc] || name] || _hasAttr(dom.byId(node), attrNames[lc] || name);
        };
        exports.get = function getAttr(node, name) {
            node = dom.byId(node);
            var lc = name.toLowerCase(), propName = prop.names[lc] || name, forceProp = forcePropNames[propName], value = node[propName];
            if (forceProp && typeof value != "undefined") {
                return value;
            }
            if (propName != "href" && (typeof value == "boolean" || lang.isFunction(value))) {
                return value;
            }
            var attrName = attrNames[lc] || name;
            return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null;
        };
        exports.set = function setAttr(node, name, value) {
            node = dom.byId(node);
            if (arguments.length == 2) {
                for (var x in name) {
                    exports.set(node, x, name[x]);
                }
                return node;
            }
            var lc = name.toLowerCase(), propName = prop.names[lc] || name, forceProp = forcePropNames[propName];
            if (propName == "style" && typeof value != "string") {
                style.set(node, value);
                return node;
            }
            if (forceProp || typeof value == "boolean" || lang.isFunction(value)) {
                return prop.set(node, name, value);
            }
            node.setAttribute(attrNames[lc] || name, value);
            return node;
        };
        exports.remove = function removeAttr(node, name) {
            dom.byId(node).removeAttribute(attrNames[name.toLowerCase()] || name);
        };
        exports.getNodeProp = function getNodeProp(node, name) {
            node = dom.byId(node);
            var lc = name.toLowerCase(), propName = prop.names[lc] || name;
            if ((propName in node) && propName != "href") {
                return node[propName];
            }
            var attrName = attrNames[lc] || name;
            return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null;
        };
    });
}, "dojo/dom-style":function () {
    define("dojo/dom-style", ["./sniff", "./dom"], function (has, dom) {
        var getComputedStyle, style = {};
        if (has("webkit")) {
            getComputedStyle = function (node) {
                var s;
                if (node.nodeType == 1) {
                    var dv = node.ownerDocument.defaultView;
                    s = dv.getComputedStyle(node, null);
                    if (!s && node.style) {
                        node.style.display = "";
                        s = dv.getComputedStyle(node, null);
                    }
                }
                return s || {};
            };
        } else {
            if (has("ie") && (has("ie") < 9 || has("quirks"))) {
                getComputedStyle = function (node) {
                    return node.nodeType == 1 && node.currentStyle ? node.currentStyle : {};
                };
            } else {
                getComputedStyle = function (node) {
                    return node.nodeType == 1 ? node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
                };
            }
        }
        style.getComputedStyle = getComputedStyle;
        var toPixel;
        if (!has("ie")) {
            toPixel = function (element, value) {
                return parseFloat(value) || 0;
            };
        } else {
            toPixel = function (element, avalue) {
                if (!avalue) {
                    return 0;
                }
                if (avalue == "medium") {
                    return 4;
                }
                if (avalue.slice && avalue.slice(-2) == "px") {
                    return parseFloat(avalue);
                }
                var s = element.style, rs = element.runtimeStyle, cs = element.currentStyle, sLeft = s.left, rsLeft = rs.left;
                rs.left = cs.left;
                try {
                    s.left = avalue;
                    avalue = s.pixelLeft;
                }
                catch (e) {
                    avalue = 0;
                }
                s.left = sLeft;
                rs.left = rsLeft;
                return avalue;
            };
        }
        style.toPixelValue = toPixel;
        var astr = "DXImageTransform.Microsoft.Alpha";
        var af = function (n, f) {
            try {
                return n.filters.item(astr);
            }
            catch (e) {
                return f ? {} : null;
            }
        };
        var _getOpacity = has("ie") < 9 || (has("ie") && has("quirks")) ? function (node) {
            try {
                return af(node).Opacity / 100;
            }
            catch (e) {
                return 1;
            }
        } : function (node) {
            return getComputedStyle(node).opacity;
        };
        var _setOpacity = has("ie") < 9 || (has("ie") && has("quirks")) ? function (node, opacity) {
            var ov = opacity * 100, opaque = opacity == 1;
            node.style.zoom = opaque ? "" : 1;
            if (!af(node)) {
                if (opaque) {
                    return opacity;
                }
                node.style.filter += " progid:" + astr + "(Opacity=" + ov + ")";
            } else {
                af(node, 1).Opacity = ov;
            }
            af(node, 1).Enabled = !opaque;
            if (node.tagName.toLowerCase() == "tr") {
                for (var td = node.firstChild; td; td = td.nextSibling) {
                    if (td.tagName.toLowerCase() == "td") {
                        _setOpacity(td, opacity);
                    }
                }
            }
            return opacity;
        } : function (node, opacity) {
            return node.style.opacity = opacity;
        };
        var _pixelNamesCache = {left:true, top:true};
        var _pixelRegExp = /margin|padding|width|height|max|min|offset/;
        function _toStyleValue(node, type, value) {
            type = type.toLowerCase();
            if (has("ie")) {
                if (value == "auto") {
                    if (type == "height") {
                        return node.offsetHeight;
                    }
                    if (type == "width") {
                        return node.offsetWidth;
                    }
                }
                if (type == "fontweight") {
                    switch (value) {
                      case 700:
                        return "bold";
                      case 400:
                      default:
                        return "normal";
                    }
                }
            }
            if (!(type in _pixelNamesCache)) {
                _pixelNamesCache[type] = _pixelRegExp.test(type);
            }
            return _pixelNamesCache[type] ? toPixel(node, value) : value;
        }
        var _floatStyle = has("ie") ? "styleFloat" : "cssFloat", _floatAliases = {"cssFloat":_floatStyle, "styleFloat":_floatStyle, "float":_floatStyle};
        style.get = function getStyle(node, name) {
            var n = dom.byId(node), l = arguments.length, op = (name == "opacity");
            if (l == 2 && op) {
                return _getOpacity(n);
            }
            name = _floatAliases[name] || name;
            var s = style.getComputedStyle(n);
            return (l == 1) ? s : _toStyleValue(n, name, s[name] || n.style[name]);
        };
        style.set = function setStyle(node, name, value) {
            var n = dom.byId(node), l = arguments.length, op = (name == "opacity");
            name = _floatAliases[name] || name;
            if (l == 3) {
                return op ? _setOpacity(n, value) : n.style[name] = value;
            }
            for (var x in name) {
                style.set(node, x, name[x]);
            }
            return style.getComputedStyle(n);
        };
        return style;
    });
}, "dojo/dom-prop":function () {
    define("dojo/dom-prop", ["exports", "./_base/kernel", "./sniff", "./_base/lang", "./dom", "./dom-style", "./dom-construct", "./_base/connect"], function (exports, dojo, has, lang, dom, style, ctr, conn) {
        var _evtHdlrMap = {}, _ctr = 0, _attrId = dojo._scopeName + "attrid";
        exports.names = {"class":"className", "for":"htmlFor", tabindex:"tabIndex", readonly:"readOnly", colspan:"colSpan", frameborder:"frameBorder", rowspan:"rowSpan", valuetype:"valueType"};
        exports.get = function getProp(node, name) {
            node = dom.byId(node);
            var lc = name.toLowerCase(), propName = exports.names[lc] || name;
            return node[propName];
        };
        exports.set = function setProp(node, name, value) {
            node = dom.byId(node);
            var l = arguments.length;
            if (l == 2 && typeof name != "string") {
                for (var x in name) {
                    exports.set(node, x, name[x]);
                }
                return node;
            }
            var lc = name.toLowerCase(), propName = exports.names[lc] || name;
            if (propName == "style" && typeof value != "string") {
                style.set(node, value);
                return node;
            }
            if (propName == "innerHTML") {
                if (has("ie") && node.tagName.toLowerCase() in {col:1, colgroup:1, table:1, tbody:1, tfoot:1, thead:1, tr:1, title:1}) {
                    ctr.empty(node);
                    node.appendChild(ctr.toDom(value, node.ownerDocument));
                } else {
                    node[propName] = value;
                }
                return node;
            }
            if (lang.isFunction(value)) {
                var attrId = node[_attrId];
                if (!attrId) {
                    attrId = _ctr++;
                    node[_attrId] = attrId;
                }
                if (!_evtHdlrMap[attrId]) {
                    _evtHdlrMap[attrId] = {};
                }
                var h = _evtHdlrMap[attrId][propName];
                if (h) {
                    conn.disconnect(h);
                } else {
                    try {
                        delete node[propName];
                    }
                    catch (e) {
                    }
                }
                if (value) {
                    _evtHdlrMap[attrId][propName] = conn.connect(node, propName, value);
                } else {
                    node[propName] = null;
                }
                return node;
            }
            node[propName] = value;
            return node;
        };
    });
}, "dojo/_base/connect":function () {
    define("dojo/_base/connect", ["./kernel", "../on", "../topic", "../aspect", "./event", "../mouse", "./sniff", "./lang", "../keys"], function (dojo, on, hub, aspect, eventModule, mouse, has, lang) {
        has.add("events-keypress-typed", function () {
            var testKeyEvent = {charCode:0};
            try {
                testKeyEvent = document.createEvent("KeyboardEvent");
                (testKeyEvent.initKeyboardEvent || testKeyEvent.initKeyEvent).call(testKeyEvent, "keypress", true, true, null, false, false, false, false, 9, 3);
            }
            catch (e) {
            }
            return testKeyEvent.charCode == 0 && !has("opera");
        });
        function connect_(obj, event, context, method, dontFix) {
            method = lang.hitch(context, method);
            if (!obj || !(obj.addEventListener || obj.attachEvent)) {
                return aspect.after(obj || dojo.global, event, method, true);
            }
            if (typeof event == "string" && event.substring(0, 2) == "on") {
                event = event.substring(2);
            }
            if (!obj) {
                obj = dojo.global;
            }
            if (!dontFix) {
                switch (event) {
                  case "keypress":
                    event = keypress;
                    break;
                  case "mouseenter":
                    event = mouse.enter;
                    break;
                  case "mouseleave":
                    event = mouse.leave;
                    break;
                }
            }
            return on(obj, event, method, dontFix);
        }
        var _punctMap = {106:42, 111:47, 186:59, 187:43, 188:44, 189:45, 190:46, 191:47, 192:96, 219:91, 220:92, 221:93, 222:39, 229:113};
        var evtCopyKey = has("mac") ? "metaKey" : "ctrlKey";
        var _synthesizeEvent = function (evt, props) {
            var faux = lang.mixin({}, evt, props);
            setKeyChar(faux);
            faux.preventDefault = function () {
                evt.preventDefault();
            };
            faux.stopPropagation = function () {
                evt.stopPropagation();
            };
            return faux;
        };
        function setKeyChar(evt) {
            evt.keyChar = evt.charCode ? String.fromCharCode(evt.charCode) : "";
            evt.charOrCode = evt.keyChar || evt.keyCode;
        }
        var keypress;
        if (has("events-keypress-typed")) {
            var _trySetKeyCode = function (e, code) {
                try {
                    return (e.keyCode = code);
                }
                catch (e) {
                    return 0;
                }
            };
            keypress = function (object, listener) {
                var keydownSignal = on(object, "keydown", function (evt) {
                    var k = evt.keyCode;
                    var unprintable = (k != 13) && k != 32 && (k != 27 || !has("ie")) && (k < 48 || k > 90) && (k < 96 || k > 111) && (k < 186 || k > 192) && (k < 219 || k > 222) && k != 229;
                    if (unprintable || evt.ctrlKey) {
                        var c = unprintable ? 0 : k;
                        if (evt.ctrlKey) {
                            if (k == 3 || k == 13) {
                                return listener.call(evt.currentTarget, evt);
                            } else {
                                if (c > 95 && c < 106) {
                                    c -= 48;
                                } else {
                                    if ((!evt.shiftKey) && (c >= 65 && c <= 90)) {
                                        c += 32;
                                    } else {
                                        c = _punctMap[c] || c;
                                    }
                                }
                            }
                        }
                        var faux = _synthesizeEvent(evt, {type:"keypress", faux:true, charCode:c});
                        listener.call(evt.currentTarget, faux);
                        if (has("ie")) {
                            _trySetKeyCode(evt, faux.keyCode);
                        }
                    }
                });
                var keypressSignal = on(object, "keypress", function (evt) {
                    var c = evt.charCode;
                    c = c >= 32 ? c : 0;
                    evt = _synthesizeEvent(evt, {charCode:c, faux:true});
                    return listener.call(this, evt);
                });
                return {remove:function () {
                    keydownSignal.remove();
                    keypressSignal.remove();
                }};
            };
        } else {
            if (has("opera")) {
                keypress = function (object, listener) {
                    return on(object, "keypress", function (evt) {
                        var c = evt.which;
                        if (c == 3) {
                            c = 99;
                        }
                        c = c < 32 && !evt.shiftKey ? 0 : c;
                        if (evt.ctrlKey && !evt.shiftKey && c >= 65 && c <= 90) {
                            c += 32;
                        }
                        return listener.call(this, _synthesizeEvent(evt, {charCode:c}));
                    });
                };
            } else {
                keypress = function (object, listener) {
                    return on(object, "keypress", function (evt) {
                        setKeyChar(evt);
                        return listener.call(this, evt);
                    });
                };
            }
        }
        var connect = {_keypress:keypress, connect:function (obj, event, context, method, dontFix) {
            var a = arguments, args = [], i = 0;
            args.push(typeof a[0] == "string" ? null : a[i++], a[i++]);
            var a1 = a[i + 1];
            args.push(typeof a1 == "string" || typeof a1 == "function" ? a[i++] : null, a[i++]);
            for (var l = a.length; i < l; i++) {
                args.push(a[i]);
            }
            return connect_.apply(this, args);
        }, disconnect:function (handle) {
            if (handle) {
                handle.remove();
            }
        }, subscribe:function (topic, context, method) {
            return hub.subscribe(topic, lang.hitch(context, method));
        }, publish:function (topic, args) {
            return hub.publish.apply(hub, [topic].concat(args));
        }, connectPublisher:function (topic, obj, event) {
            var pf = function () {
                connect.publish(topic, arguments);
            };
            return event ? connect.connect(obj, event, pf) : connect.connect(obj, pf);
        }, isCopyKey:function (e) {
            return e[evtCopyKey];
        }};
        connect.unsubscribe = connect.disconnect;
        1 && lang.mixin(dojo, connect);
        return connect;
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
}, "dojo/topic":function () {
    define("dojo/topic", ["./Evented"], function (Evented) {
        var hub = new Evented;
        return {publish:function (topic, event) {
            return hub.emit.apply(hub, arguments);
        }, subscribe:function (topic, listener) {
            return hub.on.apply(hub, arguments);
        }};
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
}, "dojo/_base/event":function () {
    define("dojo/_base/event", ["./kernel", "../on", "../has", "../dom-geometry"], function (dojo, on, has, dom) {
        if (on._fixEvent) {
            var fixEvent = on._fixEvent;
            on._fixEvent = function (evt, se) {
                evt = fixEvent(evt, se);
                if (evt) {
                    dom.normalizeEvent(evt);
                }
                return evt;
            };
        }
        var ret = {fix:function (evt, sender) {
            if (on._fixEvent) {
                return on._fixEvent(evt, sender);
            }
            return evt;
        }, stop:function (evt) {
            if (has("dom-addeventlistener") || (evt && evt.preventDefault)) {
                evt.preventDefault();
                evt.stopPropagation();
            } else {
                evt = evt || window.event;
                evt.cancelBubble = true;
                on._preventDefault.call(evt);
            }
        }};
        if (1) {
            dojo.fixEvent = ret.fix;
            dojo.stopEvent = ret.stop;
        }
        return ret;
    });
}, "dojo/dom-geometry":function () {
    define("dojo/dom-geometry", ["./sniff", "./_base/window", "./dom", "./dom-style"], function (has, win, dom, style) {
        var geom = {};
        geom.boxModel = "content-box";
        if (has("ie")) {
            geom.boxModel = document.compatMode == "BackCompat" ? "border-box" : "content-box";
        }
        geom.getPadExtents = function getPadExtents(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), px = style.toPixelValue, l = px(node, s.paddingLeft), t = px(node, s.paddingTop), r = px(node, s.paddingRight), b = px(node, s.paddingBottom);
            return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
        };
        var none = "none";
        geom.getBorderExtents = function getBorderExtents(node, computedStyle) {
            node = dom.byId(node);
            var px = style.toPixelValue, s = computedStyle || style.getComputedStyle(node), l = s.borderLeftStyle != none ? px(node, s.borderLeftWidth) : 0, t = s.borderTopStyle != none ? px(node, s.borderTopWidth) : 0, r = s.borderRightStyle != none ? px(node, s.borderRightWidth) : 0, b = s.borderBottomStyle != none ? px(node, s.borderBottomWidth) : 0;
            return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
        };
        geom.getPadBorderExtents = function getPadBorderExtents(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), p = geom.getPadExtents(node, s), b = geom.getBorderExtents(node, s);
            return {l:p.l + b.l, t:p.t + b.t, r:p.r + b.r, b:p.b + b.b, w:p.w + b.w, h:p.h + b.h};
        };
        geom.getMarginExtents = function getMarginExtents(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), px = style.toPixelValue, l = px(node, s.marginLeft), t = px(node, s.marginTop), r = px(node, s.marginRight), b = px(node, s.marginBottom);
            return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
        };
        geom.getMarginBox = function getMarginBox(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), me = geom.getMarginExtents(node, s), l = node.offsetLeft - me.l, t = node.offsetTop - me.t, p = node.parentNode, px = style.toPixelValue, pcs;
            if (has("mozilla")) {
                var sl = parseFloat(s.left), st = parseFloat(s.top);
                if (!isNaN(sl) && !isNaN(st)) {
                    l = sl;
                    t = st;
                } else {
                    if (p && p.style) {
                        pcs = style.getComputedStyle(p);
                        if (pcs.overflow != "visible") {
                            l += pcs.borderLeftStyle != none ? px(node, pcs.borderLeftWidth) : 0;
                            t += pcs.borderTopStyle != none ? px(node, pcs.borderTopWidth) : 0;
                        }
                    }
                }
            } else {
                if (has("opera") || (has("ie") == 8 && !has("quirks"))) {
                    if (p) {
                        pcs = style.getComputedStyle(p);
                        l -= pcs.borderLeftStyle != none ? px(node, pcs.borderLeftWidth) : 0;
                        t -= pcs.borderTopStyle != none ? px(node, pcs.borderTopWidth) : 0;
                    }
                }
            }
            return {l:l, t:t, w:node.offsetWidth + me.w, h:node.offsetHeight + me.h};
        };
        geom.getContentBox = function getContentBox(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), w = node.clientWidth, h, pe = geom.getPadExtents(node, s), be = geom.getBorderExtents(node, s);
            if (!w) {
                w = node.offsetWidth;
                h = node.offsetHeight;
            } else {
                h = node.clientHeight;
                be.w = be.h = 0;
            }
            if (has("opera")) {
                pe.l += be.l;
                pe.t += be.t;
            }
            return {l:pe.l, t:pe.t, w:w - pe.w - be.w, h:h - pe.h - be.h};
        };
        function setBox(node, l, t, w, h, u) {
            u = u || "px";
            var s = node.style;
            if (!isNaN(l)) {
                s.left = l + u;
            }
            if (!isNaN(t)) {
                s.top = t + u;
            }
            if (w >= 0) {
                s.width = w + u;
            }
            if (h >= 0) {
                s.height = h + u;
            }
        }
        function isButtonTag(node) {
            return node.tagName.toLowerCase() == "button" || node.tagName.toLowerCase() == "input" && (node.getAttribute("type") || "").toLowerCase() == "button";
        }
        function usesBorderBox(node) {
            return geom.boxModel == "border-box" || node.tagName.toLowerCase() == "table" || isButtonTag(node);
        }
        geom.setContentSize = function setContentSize(node, box, computedStyle) {
            node = dom.byId(node);
            var w = box.w, h = box.h;
            if (usesBorderBox(node)) {
                var pb = geom.getPadBorderExtents(node, computedStyle);
                if (w >= 0) {
                    w += pb.w;
                }
                if (h >= 0) {
                    h += pb.h;
                }
            }
            setBox(node, NaN, NaN, w, h);
        };
        var nilExtents = {l:0, t:0, w:0, h:0};
        geom.setMarginBox = function setMarginBox(node, box, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), w = box.w, h = box.h, pb = usesBorderBox(node) ? nilExtents : geom.getPadBorderExtents(node, s), mb = geom.getMarginExtents(node, s);
            if (has("webkit")) {
                if (isButtonTag(node)) {
                    var ns = node.style;
                    if (w >= 0 && !ns.width) {
                        ns.width = "4px";
                    }
                    if (h >= 0 && !ns.height) {
                        ns.height = "4px";
                    }
                }
            }
            if (w >= 0) {
                w = Math.max(w - pb.w - mb.w, 0);
            }
            if (h >= 0) {
                h = Math.max(h - pb.h - mb.h, 0);
            }
            setBox(node, box.l, box.t, w, h);
        };
        geom.isBodyLtr = function isBodyLtr(doc) {
            doc = doc || win.doc;
            return (win.body(doc).dir || doc.documentElement.dir || "ltr").toLowerCase() == "ltr";
        };
        geom.docScroll = function docScroll(doc) {
            doc = doc || win.doc;
            var node = win.doc.parentWindow || win.doc.defaultView;
            return "pageXOffset" in node ? {x:node.pageXOffset, y:node.pageYOffset} : (node = has("quirks") ? win.body(doc) : doc.documentElement) && {x:geom.fixIeBiDiScrollLeft(node.scrollLeft || 0, doc), y:node.scrollTop || 0};
        };
        if (has("ie")) {
            geom.getIeDocumentElementOffset = function getIeDocumentElementOffset(doc) {
                doc = doc || win.doc;
                var de = doc.documentElement;
                if (has("ie") < 8) {
                    var r = de.getBoundingClientRect(), l = r.left, t = r.top;
                    if (has("ie") < 7) {
                        l += de.clientLeft;
                        t += de.clientTop;
                    }
                    return {x:l < 0 ? 0 : l, y:t < 0 ? 0 : t};
                } else {
                    return {x:0, y:0};
                }
            };
        }
        geom.fixIeBiDiScrollLeft = function fixIeBiDiScrollLeft(scrollLeft, doc) {
            doc = doc || win.doc;
            var ie = has("ie");
            if (ie && !geom.isBodyLtr(doc)) {
                var qk = has("quirks"), de = qk ? win.body(doc) : doc.documentElement, pwin = win.global;
                if (ie == 6 && !qk && pwin.frameElement && de.scrollHeight > de.clientHeight) {
                    scrollLeft += de.clientLeft;
                }
                return (ie < 8 || qk) ? (scrollLeft + de.clientWidth - de.scrollWidth) : -scrollLeft;
            }
            return scrollLeft;
        };
        geom.position = function (node, includeScroll) {
            node = dom.byId(node);
            var db = win.body(node.ownerDocument), ret = node.getBoundingClientRect();
            ret = {x:ret.left, y:ret.top, w:ret.right - ret.left, h:ret.bottom - ret.top};
            if (has("ie")) {
                var offset = geom.getIeDocumentElementOffset(node.ownerDocument);
                ret.x -= offset.x + (has("quirks") ? db.clientLeft + db.offsetLeft : 0);
                ret.y -= offset.y + (has("quirks") ? db.clientTop + db.offsetTop : 0);
            }
            if (includeScroll) {
                var scroll = geom.docScroll(node.ownerDocument);
                ret.x += scroll.x;
                ret.y += scroll.y;
            }
            return ret;
        };
        geom.getMarginSize = function getMarginSize(node, computedStyle) {
            node = dom.byId(node);
            var me = geom.getMarginExtents(node, computedStyle || style.getComputedStyle(node));
            var size = node.getBoundingClientRect();
            return {w:(size.right - size.left) + me.w, h:(size.bottom - size.top) + me.h};
        };
        geom.normalizeEvent = function (event) {
            if (!("layerX" in event)) {
                event.layerX = event.offsetX;
                event.layerY = event.offsetY;
            }
            if (!has("dom-addeventlistener")) {
                var se = event.target;
                var doc = (se && se.ownerDocument) || document;
                var docBody = has("quirks") ? doc.body : doc.documentElement;
                var offset = geom.getIeDocumentElementOffset(doc);
                event.pageX = event.clientX + geom.fixIeBiDiScrollLeft(docBody.scrollLeft || 0, doc) - offset.x;
                event.pageY = event.clientY + (docBody.scrollTop || 0) - offset.y;
            }
        };
        return geom;
    });
}, "dojo/mouse":function () {
    define("dojo/mouse", ["./_base/kernel", "./on", "./has", "./dom", "./_base/window"], function (dojo, on, has, dom, win) {
        has.add("dom-quirks", win.doc && win.doc.compatMode == "BackCompat");
        has.add("events-mouseenter", win.doc && "onmouseenter" in win.doc.createElement("div"));
        has.add("events-mousewheel", win.doc && "onmousewheel" in win.doc);
        var mouseButtons;
        if (has("dom-quirks") || !has("dom-addeventlistener")) {
            mouseButtons = {LEFT:1, MIDDLE:4, RIGHT:2, isButton:function (e, button) {
                return e.button & button;
            }, isLeft:function (e) {
                return e.button & 1;
            }, isMiddle:function (e) {
                return e.button & 4;
            }, isRight:function (e) {
                return e.button & 2;
            }};
        } else {
            mouseButtons = {LEFT:0, MIDDLE:1, RIGHT:2, isButton:function (e, button) {
                return e.button == button;
            }, isLeft:function (e) {
                return e.button == 0;
            }, isMiddle:function (e) {
                return e.button == 1;
            }, isRight:function (e) {
                return e.button == 2;
            }};
        }
        dojo.mouseButtons = mouseButtons;
        function eventHandler(type, selectHandler) {
            var handler = function (node, listener) {
                return on(node, type, function (evt) {
                    if (selectHandler) {
                        return selectHandler(evt, listener);
                    }
                    if (!dom.isDescendant(evt.relatedTarget, node)) {
                        return listener.call(this, evt);
                    }
                });
            };
            handler.bubble = function (select) {
                return eventHandler(type, function (evt, listener) {
                    var target = select(evt.target);
                    var relatedTarget = evt.relatedTarget;
                    if (target && (target != (relatedTarget && relatedTarget.nodeType == 1 && select(relatedTarget)))) {
                        return listener.call(target, evt);
                    }
                });
            };
            return handler;
        }
        var wheel;
        if (has("events-mousewheel")) {
            wheel = "mousewheel";
        } else {
            wheel = function (node, listener) {
                return on(node, "DOMMouseScroll", function (evt) {
                    evt.wheelDelta = -evt.detail;
                    listener.call(this, evt);
                });
            };
        }
        return {_eventHandler:eventHandler, enter:eventHandler("mouseover"), leave:eventHandler("mouseout"), wheel:wheel, isLeft:mouseButtons.isLeft, isMiddle:mouseButtons.isMiddle, isRight:mouseButtons.isRight};
    });
}, "dojo/_base/sniff":function () {
    define("dojo/_base/sniff", ["./kernel", "./lang", "../sniff"], function (dojo, lang, has) {
        if (!has("host-browser")) {
            return has;
        }
        dojo._name = "browser";
        lang.mixin(dojo, {isBrowser:true, isFF:has("ff"), isIE:has("ie"), isKhtml:has("khtml"), isWebKit:has("webkit"), isMozilla:has("mozilla"), isMoz:has("mozilla"), isOpera:has("opera"), isSafari:has("safari"), isChrome:has("chrome"), isMac:has("mac"), isIos:has("ios"), isAndroid:has("android"), isWii:has("wii"), isQuirks:has("quirks"), isAir:has("air")});
        dojo.locale = dojo.locale || (has("ie") ? navigator.userLanguage : navigator.language).toLowerCase();
        return has;
    });
}, "dojo/keys":function () {
    define("dojo/keys", ["./_base/kernel", "./sniff"], function (dojo, has) {
        return dojo.keys = {BACKSPACE:8, TAB:9, CLEAR:12, ENTER:13, SHIFT:16, CTRL:17, ALT:18, META:has("webkit") ? 91 : 224, PAUSE:19, CAPS_LOCK:20, ESCAPE:27, SPACE:32, PAGE_UP:33, PAGE_DOWN:34, END:35, HOME:36, LEFT_ARROW:37, UP_ARROW:38, RIGHT_ARROW:39, DOWN_ARROW:40, INSERT:45, DELETE:46, HELP:47, LEFT_WINDOW:91, RIGHT_WINDOW:92, SELECT:93, NUMPAD_0:96, NUMPAD_1:97, NUMPAD_2:98, NUMPAD_3:99, NUMPAD_4:100, NUMPAD_5:101, NUMPAD_6:102, NUMPAD_7:103, NUMPAD_8:104, NUMPAD_9:105, NUMPAD_MULTIPLY:106, NUMPAD_PLUS:107, NUMPAD_ENTER:108, NUMPAD_MINUS:109, NUMPAD_PERIOD:110, NUMPAD_DIVIDE:111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, F13:124, F14:125, F15:126, NUM_LOCK:144, SCROLL_LOCK:145, UP_DPAD:175, DOWN_DPAD:176, LEFT_DPAD:177, RIGHT_DPAD:178, copyKey:has("mac") && !has("air") ? (has("safari") ? 91 : 224) : 17};
    });
}, "dojo/ready":function () {
    define("dojo/ready", ["./_base/kernel", "./has", "require", "./has!host-browser?./domReady", "./_base/lang"], function (dojo, has, require, domReady, lang) {
        var isDomReady = 0, requestCompleteSignal, loadQ = [], onLoadRecursiveGuard = 0, handleDomReady = function () {
            isDomReady = 1;
            dojo._postLoad = dojo.config.afterOnLoad = true;
            if (loadQ.length) {
                requestCompleteSignal(onLoad);
            }
        }, onLoad = function () {
            if (isDomReady && !onLoadRecursiveGuard && loadQ.length) {
                onLoadRecursiveGuard = 1;
                var f = loadQ.shift();
                try {
                    f();
                }
                finally {
                    onLoadRecursiveGuard = 0;
                }
                onLoadRecursiveGuard = 0;
                if (loadQ.length) {
                    requestCompleteSignal(onLoad);
                }
            }
        };
        require.on("idle", onLoad);
        requestCompleteSignal = function () {
            if (require.idle()) {
                onLoad();
            }
        };
        var ready = dojo.ready = dojo.addOnLoad = function (priority, context, callback) {
            var hitchArgs = lang._toArray(arguments);
            if (typeof priority != "number") {
                callback = context;
                context = priority;
                priority = 1000;
            } else {
                hitchArgs.shift();
            }
            callback = callback ? lang.hitch.apply(dojo, hitchArgs) : function () {
                context();
            };
            callback.priority = priority;
            for (var i = 0; i < loadQ.length && priority >= loadQ[i].priority; i++) {
            }
            loadQ.splice(i, 0, callback);
            requestCompleteSignal();
        };
        1 || has.add("dojo-config-addOnLoad", 1);
        if (1) {
            var dca = dojo.config.addOnLoad;
            if (dca) {
                ready[(lang.isArray(dca) ? "apply" : "call")](dojo, dca);
            }
        }
        if (1 && dojo.config.parseOnLoad && !dojo.isAsync) {
            ready(99, function () {
                if (!dojo.parser) {
                    dojo.deprecated("Add explicit require(['dojo/parser']);", "", "2.0");
                    require(["dojo/parser"]);
                }
            });
        }
        if (has("host-browser")) {
            domReady(handleDomReady);
        } else {
            handleDomReady();
        }
        return ready;
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
}, "dojo/router":function () {
    define("dojo/router", ["./router/RouterBase"], function (RouterBase) {
        return new RouterBase({});
    });
}, "dojo/router/RouterBase":function () {
    define("dojo/router/RouterBase", ["dojo/_base/declare", "dojo/hash", "dojo/topic"], function (declare, hash, topic) {
        var trim;
        if (String.prototype.trim) {
            trim = function (str) {
                return str.trim();
            };
        } else {
            trim = function (str) {
                return str.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
            };
        }
        function fireRoute(params, currentPath, newPath) {
            var queue, isStopped, isPrevented, eventObj, i, l;
            queue = this.callbackQueue;
            isStopped = false;
            isPrevented = false;
            eventObj = {stopImmediatePropagation:function () {
                isStopped = true;
            }, preventDefault:function () {
                isPrevented = true;
            }, oldPath:currentPath, newPath:newPath, params:params};
            for (i = 0, l = queue.length; i < l; ++i) {
                if (!isStopped) {
                    queue[i](eventObj);
                }
            }
            return !isPrevented;
        }
        var RouterBase = declare(null, {_routes:null, _routeIndex:null, _started:false, _currentPath:"", idMatch:/:(\w[\w\d]*)/g, idReplacement:"([^\\/]+)", globMatch:/\*(\w[\w\d]*)/, globReplacement:"(.+)", constructor:function (kwArgs) {
            this._routes = [];
            this._routeIndex = {};
            for (var i in kwArgs) {
                if (kwArgs.hasOwnProperty(i)) {
                    this[i] = kwArgs[i];
                }
            }
        }, register:function (route, callback) {
            return this._registerRoute(route, callback);
        }, registerBefore:function (route, callback) {
            return this._registerRoute(route, callback, true);
        }, go:function (path, replace) {
            var applyChange;
            path = trim(path);
            applyChange = this._handlePathChange(path);
            if (applyChange) {
                hash(path, replace);
            }
            return applyChange;
        }, startup:function () {
            if (this._started) {
                return;
            }
            var self = this;
            this._started = true;
            this._handlePathChange(hash());
            topic.subscribe("/dojo/hashchange", function () {
                self._handlePathChange.apply(self, arguments);
            });
        }, _handlePathChange:function (newPath) {
            var i, j, li, lj, routeObj, result, allowChange, parameterNames, params, routes = this._routes, currentPath = this._currentPath;
            if (!this._started || newPath === currentPath) {
                return allowChange;
            }
            allowChange = true;
            for (i = 0, li = routes.length; i < li; ++i) {
                routeObj = routes[i];
                result = routeObj.route.exec(newPath);
                if (result) {
                    if (routeObj.parameterNames) {
                        parameterNames = routeObj.parameterNames;
                        params = {};
                        for (j = 0, lj = parameterNames.length; j < lj; ++j) {
                            params[parameterNames[j]] = result[j + 1];
                        }
                    } else {
                        params = result.slice(1);
                    }
                    allowChange = routeObj.fire(params, currentPath, newPath);
                }
            }
            if (allowChange) {
                this._currentPath = newPath;
            }
            return allowChange;
        }, _convertRouteToRegExp:function (route) {
            route = route.replace(this.idMatch, this.idReplacement);
            route = route.replace(this.globMatch, this.globReplacement);
            route = "^" + route + "$";
            return new RegExp(route);
        }, _getParameterNames:function (route) {
            var idMatch = this.idMatch, globMatch = this.globMatch, parameterNames = [], match;
            idMatch.lastIndex = 0;
            while ((match = idMatch.exec(route)) !== null) {
                parameterNames.push(match[1]);
            }
            if ((match = globMatch.exec(route)) !== null) {
                parameterNames.push(match[1]);
            }
            return parameterNames.length > 0 ? parameterNames : null;
        }, _indexRoutes:function () {
            var i, l, route, routeIndex, routes = this._routes;
            routeIndex = this._routeIndex = {};
            for (i = 0, l = routes.length; i < l; ++i) {
                route = routes[i];
                routeIndex[route.route] = i;
            }
        }, _registerRoute:function (route, callback, isBefore) {
            var index, exists, routeObj, callbackQueue, removed, self = this, routes = this._routes, routeIndex = this._routeIndex;
            index = this._routeIndex[route];
            exists = typeof index !== "undefined";
            if (exists) {
                routeObj = routes[index];
            }
            if (!routeObj) {
                routeObj = {route:route, callbackQueue:[], fire:fireRoute};
            }
            callbackQueue = routeObj.callbackQueue;
            if (typeof route == "string") {
                routeObj.parameterNames = this._getParameterNames(route);
                routeObj.route = this._convertRouteToRegExp(route);
            }
            if (isBefore) {
                callbackQueue.unshift(callback);
            } else {
                callbackQueue.push(callback);
            }
            if (!exists) {
                index = routes.length;
                routeIndex[route] = index;
                routes.push(routeObj);
            }
            removed = false;
            return {remove:function () {
                var i, l;
                if (removed) {
                    return;
                }
                for (i = 0, l = callbackQueue.length; i < l; ++i) {
                    if (callbackQueue[i] === callback) {
                        callbackQueue.splice(i, 1);
                    }
                }
                if (callbackQueue.length === 0) {
                    routes.splice(index, 1);
                    self._indexRoutes();
                }
                removed = true;
            }, register:function (callback, isBefore) {
                return self.register(route, callback, isBefore);
            }};
        }});
        return RouterBase;
    });
}, "dojo/_base/declare":function () {
    define("dojo/_base/declare", ["./kernel", "../has", "./lang"], function (dojo, has, lang) {
        var mix = lang.mixin, op = Object.prototype, opts = op.toString, xtor = new Function, counter = 0, cname = "constructor";
        function err(msg, cls) {
            throw new Error("declare" + (cls ? " " + cls : "") + ": " + msg);
        }
        function c3mro(bases, className) {
            var result = [], roots = [{cls:0, refs:[]}], nameMap = {}, clsCount = 1, l = bases.length, i = 0, j, lin, base, top, proto, rec, name, refs;
            for (; i < l; ++i) {
                base = bases[i];
                if (!base) {
                    err("mixin #" + i + " is unknown. Did you use dojo.require to pull it in?", className);
                } else {
                    if (opts.call(base) != "[object Function]") {
                        err("mixin #" + i + " is not a callable constructor.", className);
                    }
                }
                lin = base._meta ? base._meta.bases : [base];
                top = 0;
                for (j = lin.length - 1; j >= 0; --j) {
                    proto = lin[j].prototype;
                    if (!proto.hasOwnProperty("declaredClass")) {
                        proto.declaredClass = "uniqName_" + (counter++);
                    }
                    name = proto.declaredClass;
                    if (!nameMap.hasOwnProperty(name)) {
                        nameMap[name] = {count:0, refs:[], cls:lin[j]};
                        ++clsCount;
                    }
                    rec = nameMap[name];
                    if (top && top !== rec) {
                        rec.refs.push(top);
                        ++top.count;
                    }
                    top = rec;
                }
                ++top.count;
                roots[0].refs.push(top);
            }
            while (roots.length) {
                top = roots.pop();
                result.push(top.cls);
                --clsCount;
                while (refs = top.refs, refs.length == 1) {
                    top = refs[0];
                    if (!top || --top.count) {
                        top = 0;
                        break;
                    }
                    result.push(top.cls);
                    --clsCount;
                }
                if (top) {
                    for (i = 0, l = refs.length; i < l; ++i) {
                        top = refs[i];
                        if (!--top.count) {
                            roots.push(top);
                        }
                    }
                }
            }
            if (clsCount) {
                err("can't build consistent linearization", className);
            }
            base = bases[0];
            result[0] = base ? base._meta && base === result[result.length - base._meta.bases.length] ? base._meta.bases.length : 1 : 0;
            return result;
        }
        function inherited(args, a, f) {
            var name, chains, bases, caller, meta, base, proto, opf, pos, cache = this._inherited = this._inherited || {};
            if (typeof args == "string") {
                name = args;
                args = a;
                a = f;
            }
            f = 0;
            caller = args.callee;
            name = name || caller.nom;
            if (!name) {
                err("can't deduce a name to call inherited()", this.declaredClass);
            }
            meta = this.constructor._meta;
            bases = meta.bases;
            pos = cache.p;
            if (name != cname) {
                if (cache.c !== caller) {
                    pos = 0;
                    base = bases[0];
                    meta = base._meta;
                    if (meta.hidden[name] !== caller) {
                        chains = meta.chains;
                        if (chains && typeof chains[name] == "string") {
                            err("calling chained method with inherited: " + name, this.declaredClass);
                        }
                        do {
                            meta = base._meta;
                            proto = base.prototype;
                            if (meta && (proto[name] === caller && proto.hasOwnProperty(name) || meta.hidden[name] === caller)) {
                                break;
                            }
                        } while (base = bases[++pos]);
                        pos = base ? pos : -1;
                    }
                }
                base = bases[++pos];
                if (base) {
                    proto = base.prototype;
                    if (base._meta && proto.hasOwnProperty(name)) {
                        f = proto[name];
                    } else {
                        opf = op[name];
                        do {
                            proto = base.prototype;
                            f = proto[name];
                            if (f && (base._meta ? proto.hasOwnProperty(name) : f !== opf)) {
                                break;
                            }
                        } while (base = bases[++pos]);
                    }
                }
                f = base && f || op[name];
            } else {
                if (cache.c !== caller) {
                    pos = 0;
                    meta = bases[0]._meta;
                    if (meta && meta.ctor !== caller) {
                        chains = meta.chains;
                        if (!chains || chains.constructor !== "manual") {
                            err("calling chained constructor with inherited", this.declaredClass);
                        }
                        while (base = bases[++pos]) {
                            meta = base._meta;
                            if (meta && meta.ctor === caller) {
                                break;
                            }
                        }
                        pos = base ? pos : -1;
                    }
                }
                while (base = bases[++pos]) {
                    meta = base._meta;
                    f = meta ? meta.ctor : base;
                    if (f) {
                        break;
                    }
                }
                f = base && f;
            }
            cache.c = f;
            cache.p = pos;
            if (f) {
                return a === true ? f : f.apply(this, a || args);
            }
        }
        function getInherited(name, args) {
            if (typeof name == "string") {
                return this.__inherited(name, args, true);
            }
            return this.__inherited(name, true);
        }
        function inherited__debug(args, a1, a2) {
            var f = this.getInherited(args, a1);
            if (f) {
                return f.apply(this, a2 || a1 || args);
            }
        }
        var inheritedImpl = dojo.config.isDebug ? inherited__debug : inherited;
        function isInstanceOf(cls) {
            var bases = this.constructor._meta.bases;
            for (var i = 0, l = bases.length; i < l; ++i) {
                if (bases[i] === cls) {
                    return true;
                }
            }
            return this instanceof cls;
        }
        function mixOwn(target, source) {
            for (var name in source) {
                if (name != cname && source.hasOwnProperty(name)) {
                    target[name] = source[name];
                }
            }
            if (has("bug-for-in-skips-shadowed")) {
                for (var extraNames = lang._extraNames, i = extraNames.length; i; ) {
                    name = extraNames[--i];
                    if (name != cname && source.hasOwnProperty(name)) {
                        target[name] = source[name];
                    }
                }
            }
        }
        function safeMixin(target, source) {
            var name, t;
            for (name in source) {
                t = source[name];
                if ((t !== op[name] || !(name in op)) && name != cname) {
                    if (opts.call(t) == "[object Function]") {
                        t.nom = name;
                    }
                    target[name] = t;
                }
            }
            if (has("bug-for-in-skips-shadowed")) {
                for (var extraNames = lang._extraNames, i = extraNames.length; i; ) {
                    name = extraNames[--i];
                    t = source[name];
                    if ((t !== op[name] || !(name in op)) && name != cname) {
                        if (opts.call(t) == "[object Function]") {
                            t.nom = name;
                        }
                        target[name] = t;
                    }
                }
            }
            return target;
        }
        function extend(source) {
            declare.safeMixin(this.prototype, source);
            return this;
        }
        function createSubclass(mixins) {
            return declare([this].concat(mixins));
        }
        function chainedConstructor(bases, ctorSpecial) {
            return function () {
                var a = arguments, args = a, a0 = a[0], f, i, m, l = bases.length, preArgs;
                if (!(this instanceof a.callee)) {
                    return applyNew(a);
                }
                if (ctorSpecial && (a0 && a0.preamble || this.preamble)) {
                    preArgs = new Array(bases.length);
                    preArgs[0] = a;
                    for (i = 0; ; ) {
                        a0 = a[0];
                        if (a0) {
                            f = a0.preamble;
                            if (f) {
                                a = f.apply(this, a) || a;
                            }
                        }
                        f = bases[i].prototype;
                        f = f.hasOwnProperty("preamble") && f.preamble;
                        if (f) {
                            a = f.apply(this, a) || a;
                        }
                        if (++i == l) {
                            break;
                        }
                        preArgs[i] = a;
                    }
                }
                for (i = l - 1; i >= 0; --i) {
                    f = bases[i];
                    m = f._meta;
                    f = m ? m.ctor : f;
                    if (f) {
                        f.apply(this, preArgs ? preArgs[i] : a);
                    }
                }
                f = this.postscript;
                if (f) {
                    f.apply(this, args);
                }
            };
        }
        function singleConstructor(ctor, ctorSpecial) {
            return function () {
                var a = arguments, t = a, a0 = a[0], f;
                if (!(this instanceof a.callee)) {
                    return applyNew(a);
                }
                if (ctorSpecial) {
                    if (a0) {
                        f = a0.preamble;
                        if (f) {
                            t = f.apply(this, t) || t;
                        }
                    }
                    f = this.preamble;
                    if (f) {
                        f.apply(this, t);
                    }
                }
                if (ctor) {
                    ctor.apply(this, a);
                }
                f = this.postscript;
                if (f) {
                    f.apply(this, a);
                }
            };
        }
        function simpleConstructor(bases) {
            return function () {
                var a = arguments, i = 0, f, m;
                if (!(this instanceof a.callee)) {
                    return applyNew(a);
                }
                for (; f = bases[i]; ++i) {
                    m = f._meta;
                    f = m ? m.ctor : f;
                    if (f) {
                        f.apply(this, a);
                        break;
                    }
                }
                f = this.postscript;
                if (f) {
                    f.apply(this, a);
                }
            };
        }
        function chain(name, bases, reversed) {
            return function () {
                var b, m, f, i = 0, step = 1;
                if (reversed) {
                    i = bases.length - 1;
                    step = -1;
                }
                for (; b = bases[i]; i += step) {
                    m = b._meta;
                    f = (m ? m.hidden : b.prototype)[name];
                    if (f) {
                        f.apply(this, arguments);
                    }
                }
            };
        }
        function forceNew(ctor) {
            xtor.prototype = ctor.prototype;
            var t = new xtor;
            xtor.prototype = null;
            return t;
        }
        function applyNew(args) {
            var ctor = args.callee, t = forceNew(ctor);
            ctor.apply(t, args);
            return t;
        }
        function declare(className, superclass, props) {
            if (typeof className != "string") {
                props = superclass;
                superclass = className;
                className = "";
            }
            props = props || {};
            var proto, i, t, ctor, name, bases, chains, mixins = 1, parents = superclass;
            if (opts.call(superclass) == "[object Array]") {
                bases = c3mro(superclass, className);
                t = bases[0];
                mixins = bases.length - t;
                superclass = bases[mixins];
            } else {
                bases = [0];
                if (superclass) {
                    if (opts.call(superclass) == "[object Function]") {
                        t = superclass._meta;
                        bases = bases.concat(t ? t.bases : superclass);
                    } else {
                        err("base class is not a callable constructor.", className);
                    }
                } else {
                    if (superclass !== null) {
                        err("unknown base class. Did you use dojo.require to pull it in?", className);
                    }
                }
            }
            if (superclass) {
                for (i = mixins - 1; ; --i) {
                    proto = forceNew(superclass);
                    if (!i) {
                        break;
                    }
                    t = bases[i];
                    (t._meta ? mixOwn : mix)(proto, t.prototype);
                    ctor = new Function;
                    ctor.superclass = superclass;
                    ctor.prototype = proto;
                    superclass = proto.constructor = ctor;
                }
            } else {
                proto = {};
            }
            declare.safeMixin(proto, props);
            t = props.constructor;
            if (t !== op.constructor) {
                t.nom = cname;
                proto.constructor = t;
            }
            for (i = mixins - 1; i; --i) {
                t = bases[i]._meta;
                if (t && t.chains) {
                    chains = mix(chains || {}, t.chains);
                }
            }
            if (proto["-chains-"]) {
                chains = mix(chains || {}, proto["-chains-"]);
            }
            t = !chains || !chains.hasOwnProperty(cname);
            bases[0] = ctor = (chains && chains.constructor === "manual") ? simpleConstructor(bases) : (bases.length == 1 ? singleConstructor(props.constructor, t) : chainedConstructor(bases, t));
            ctor._meta = {bases:bases, hidden:props, chains:chains, parents:parents, ctor:props.constructor};
            ctor.superclass = superclass && superclass.prototype;
            ctor.extend = extend;
            ctor.createSubclass = createSubclass;
            ctor.prototype = proto;
            proto.constructor = ctor;
            proto.getInherited = getInherited;
            proto.isInstanceOf = isInstanceOf;
            proto.inherited = inheritedImpl;
            proto.__inherited = inherited;
            if (className) {
                proto.declaredClass = className;
                lang.setObject(className, ctor);
            }
            if (chains) {
                for (name in chains) {
                    if (proto[name] && typeof chains[name] == "string" && name != cname) {
                        t = proto[name] = chain(name, bases, chains[name] === "after");
                        t.nom = name;
                    }
                }
            }
            return ctor;
        }
        dojo.safeMixin = declare.safeMixin = safeMixin;
        dojo.declare = declare;
        return declare;
    });
}, "dojo/hash":function () {
    define("dojo/hash", ["./_base/kernel", "require", "./_base/config", "./_base/connect", "./_base/lang", "./ready", "./sniff"], function (dojo, require, config, connect, lang, ready, has) {
        dojo.hash = function (hash, replace) {
            if (!arguments.length) {
                return _getHash();
            }
            if (hash.charAt(0) == "#") {
                hash = hash.substring(1);
            }
            if (replace) {
                _replace(hash);
            } else {
                location.href = "#" + hash;
            }
            return hash;
        };
        var _recentHash, _ieUriMonitor, _connect, _pollFrequency = config.hashPollFrequency || 100;
        function _getSegment(str, delimiter) {
            var i = str.indexOf(delimiter);
            return (i >= 0) ? str.substring(i + 1) : "";
        }
        function _getHash() {
            return _getSegment(location.href, "#");
        }
        function _dispatchEvent() {
            connect.publish("/dojo/hashchange", [_getHash()]);
        }
        function _pollLocation() {
            if (_getHash() === _recentHash) {
                return;
            }
            _recentHash = _getHash();
            _dispatchEvent();
        }
        function _replace(hash) {
            if (_ieUriMonitor) {
                if (_ieUriMonitor.isTransitioning()) {
                    setTimeout(lang.hitch(null, _replace, hash), _pollFrequency);
                    return;
                }
                var href = _ieUriMonitor.iframe.location.href;
                var index = href.indexOf("?");
                _ieUriMonitor.iframe.location.replace(href.substring(0, index) + "?" + hash);
                return;
            }
            location.replace("#" + hash);
            !_connect && _pollLocation();
        }
        function IEUriMonitor() {
            var ifr = document.createElement("iframe"), IFRAME_ID = "dojo-hash-iframe", ifrSrc = config.dojoBlankHtmlUrl || require.toUrl("./resources/blank.html");
            if (config.useXDomain && !config.dojoBlankHtmlUrl) {
                console.warn("dojo.hash: When using cross-domain Dojo builds," + " please save dojo/resources/blank.html to your domain and set djConfig.dojoBlankHtmlUrl" + " to the path on your domain to blank.html");
            }
            ifr.id = IFRAME_ID;
            ifr.src = ifrSrc + "?" + _getHash();
            ifr.style.display = "none";
            document.body.appendChild(ifr);
            this.iframe = dojo.global[IFRAME_ID];
            var recentIframeQuery, transitioning, expectedIFrameQuery, docTitle, ifrOffline, iframeLoc = this.iframe.location;
            function resetState() {
                _recentHash = _getHash();
                recentIframeQuery = ifrOffline ? _recentHash : _getSegment(iframeLoc.href, "?");
                transitioning = false;
                expectedIFrameQuery = null;
            }
            this.isTransitioning = function () {
                return transitioning;
            };
            this.pollLocation = function () {
                if (!ifrOffline) {
                    try {
                        var iframeSearch = _getSegment(iframeLoc.href, "?");
                        if (document.title != docTitle) {
                            docTitle = this.iframe.document.title = document.title;
                        }
                    }
                    catch (e) {
                        ifrOffline = true;
                        console.error("dojo.hash: Error adding history entry. Server unreachable.");
                    }
                }
                var hash = _getHash();
                if (transitioning && _recentHash === hash) {
                    if (ifrOffline || iframeSearch === expectedIFrameQuery) {
                        resetState();
                        _dispatchEvent();
                    } else {
                        setTimeout(lang.hitch(this, this.pollLocation), 0);
                        return;
                    }
                } else {
                    if (_recentHash === hash && (ifrOffline || recentIframeQuery === iframeSearch)) {
                    } else {
                        if (_recentHash !== hash) {
                            _recentHash = hash;
                            transitioning = true;
                            expectedIFrameQuery = hash;
                            ifr.src = ifrSrc + "?" + expectedIFrameQuery;
                            ifrOffline = false;
                            setTimeout(lang.hitch(this, this.pollLocation), 0);
                            return;
                        } else {
                            if (!ifrOffline) {
                                location.href = "#" + iframeLoc.search.substring(1);
                                resetState();
                                _dispatchEvent();
                            }
                        }
                    }
                }
                setTimeout(lang.hitch(this, this.pollLocation), _pollFrequency);
            };
            resetState();
            setTimeout(lang.hitch(this, this.pollLocation), _pollFrequency);
        }
        ready(function () {
            if ("onhashchange" in dojo.global && (!has("ie") || (has("ie") >= 8 && document.compatMode != "BackCompat"))) {
                _connect = connect.connect(dojo.global, "onhashchange", _dispatchEvent);
            } else {
                if (document.addEventListener) {
                    _recentHash = _getHash();
                    setInterval(_pollLocation, _pollFrequency);
                } else {
                    if (document.attachEvent) {
                        _ieUriMonitor = new IEUriMonitor();
                    }
                }
            }
        });
        return dojo.hash;
    });
}, "dijit/Tooltip":function () {
    require({cache:{"url:dijit/templates/Tooltip.html":"<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\"\n\t><div class=\"dijitTooltipContainer dijitTooltipContents\" data-dojo-attach-point=\"containerNode\" role='alert'></div\n\t><div class=\"dijitTooltipConnector\" data-dojo-attach-point=\"connectorNode\"></div\n></div>\n"}});
    define("dijit/Tooltip", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/fx", "dojo/dom", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/lang", "dojo/mouse", "dojo/on", "dojo/sniff", "./_base/manager", "./place", "./_Widget", "./_TemplatedMixin", "./BackgroundIframe", "dojo/text!./templates/Tooltip.html", "./main"], function (array, declare, fx, dom, domClass, domGeometry, domStyle, lang, mouse, on, has, manager, place, _Widget, _TemplatedMixin, BackgroundIframe, template, dijit) {
        var MasterTooltip = declare("dijit._MasterTooltip", [_Widget, _TemplatedMixin], {duration:manager.defaultDuration, templateString:template, postCreate:function () {
            this.ownerDocumentBody.appendChild(this.domNode);
            this.bgIframe = new BackgroundIframe(this.domNode);
            this.fadeIn = fx.fadeIn({node:this.domNode, duration:this.duration, onEnd:lang.hitch(this, "_onShow")});
            this.fadeOut = fx.fadeOut({node:this.domNode, duration:this.duration, onEnd:lang.hitch(this, "_onHide")});
        }, show:function (innerHTML, aroundNode, position, rtl, textDir) {
            if (this.aroundNode && this.aroundNode === aroundNode && this.containerNode.innerHTML == innerHTML) {
                return;
            }
            if (this.fadeOut.status() == "playing") {
                this._onDeck = arguments;
                return;
            }
            this.containerNode.innerHTML = innerHTML;
            this.set("textDir", textDir);
            this.containerNode.align = rtl ? "right" : "left";
            var pos = place.around(this.domNode, aroundNode, position && position.length ? position : Tooltip.defaultPosition, !rtl, lang.hitch(this, "orient"));
            var aroundNodeCoords = pos.aroundNodePos;
            if (pos.corner.charAt(0) == "M" && pos.aroundCorner.charAt(0) == "M") {
                this.connectorNode.style.top = aroundNodeCoords.y + ((aroundNodeCoords.h - this.connectorNode.offsetHeight) >> 1) - pos.y + "px";
                this.connectorNode.style.left = "";
            } else {
                if (pos.corner.charAt(1) == "M" && pos.aroundCorner.charAt(1) == "M") {
                    this.connectorNode.style.left = aroundNodeCoords.x + ((aroundNodeCoords.w - this.connectorNode.offsetWidth) >> 1) - pos.x + "px";
                } else {
                    this.connectorNode.style.left = "";
                    this.connectorNode.style.top = "";
                }
            }
            domStyle.set(this.domNode, "opacity", 0);
            this.fadeIn.play();
            this.isShowingNow = true;
            this.aroundNode = aroundNode;
        }, orient:function (node, aroundCorner, tooltipCorner, spaceAvailable, aroundNodeCoords) {
            this.connectorNode.style.top = "";
            var heightAvailable = spaceAvailable.h, widthAvailable = spaceAvailable.w;
            node.className = "dijitTooltip " + {"MR-ML":"dijitTooltipRight", "ML-MR":"dijitTooltipLeft", "TM-BM":"dijitTooltipAbove", "BM-TM":"dijitTooltipBelow", "BL-TL":"dijitTooltipBelow dijitTooltipABLeft", "TL-BL":"dijitTooltipAbove dijitTooltipABLeft", "BR-TR":"dijitTooltipBelow dijitTooltipABRight", "TR-BR":"dijitTooltipAbove dijitTooltipABRight", "BR-BL":"dijitTooltipRight", "BL-BR":"dijitTooltipLeft"}[aroundCorner + "-" + tooltipCorner];
            this.domNode.style.width = "auto";
            var size = domGeometry.position(this.domNode);
            if (has("ie") == 9) {
                size.w += 2;
            }
            var width = Math.min((Math.max(widthAvailable, 1)), size.w);
            domGeometry.setMarginBox(this.domNode, {w:width});
            if (tooltipCorner.charAt(0) == "B" && aroundCorner.charAt(0) == "B") {
                var bb = domGeometry.position(node);
                var tooltipConnectorHeight = this.connectorNode.offsetHeight;
                if (bb.h > heightAvailable) {
                    var aroundNodePlacement = heightAvailable - ((aroundNodeCoords.h + tooltipConnectorHeight) >> 1);
                    this.connectorNode.style.top = aroundNodePlacement + "px";
                    this.connectorNode.style.bottom = "";
                } else {
                    this.connectorNode.style.bottom = Math.min(Math.max(aroundNodeCoords.h / 2 - tooltipConnectorHeight / 2, 0), bb.h - tooltipConnectorHeight) + "px";
                    this.connectorNode.style.top = "";
                }
            } else {
                this.connectorNode.style.top = "";
                this.connectorNode.style.bottom = "";
            }
            return Math.max(0, size.w - widthAvailable);
        }, _onShow:function () {
            if (has("ie")) {
                this.domNode.style.filter = "";
            }
        }, hide:function (aroundNode) {
            if (this._onDeck && this._onDeck[1] == aroundNode) {
                this._onDeck = null;
            } else {
                if (this.aroundNode === aroundNode) {
                    this.fadeIn.stop();
                    this.isShowingNow = false;
                    this.aroundNode = null;
                    this.fadeOut.play();
                } else {
                }
            }
        }, _onHide:function () {
            this.domNode.style.cssText = "";
            this.containerNode.innerHTML = "";
            if (this._onDeck) {
                this.show.apply(this, this._onDeck);
                this._onDeck = null;
            }
        }, _setAutoTextDir:function (node) {
            this.applyTextDir(node, has("ie") ? node.outerText : node.textContent);
            array.forEach(node.children, function (child) {
                this._setAutoTextDir(child);
            }, this);
        }, _setTextDirAttr:function (textDir) {
            this._set("textDir", typeof textDir != "undefined" ? textDir : "");
            if (textDir == "auto") {
                this._setAutoTextDir(this.containerNode);
            } else {
                this.containerNode.dir = this.textDir;
            }
        }});
        dijit.showTooltip = function (innerHTML, aroundNode, position, rtl, textDir) {
            if (position) {
                position = array.map(position, function (val) {
                    return {after:"after-centered", before:"before-centered"}[val] || val;
                });
            }
            if (!Tooltip._masterTT) {
                dijit._masterTT = Tooltip._masterTT = new MasterTooltip();
            }
            return Tooltip._masterTT.show(innerHTML, aroundNode, position, rtl, textDir);
        };
        dijit.hideTooltip = function (aroundNode) {
            return Tooltip._masterTT && Tooltip._masterTT.hide(aroundNode);
        };
        var Tooltip = declare("dijit.Tooltip", _Widget, {label:"", showDelay:400, connectId:[], position:[], selector:"", _setConnectIdAttr:function (newId) {
            array.forEach(this._connections || [], function (nested) {
                array.forEach(nested, function (handle) {
                    handle.remove();
                });
            }, this);
            this._connectIds = array.filter(lang.isArrayLike(newId) ? newId : (newId ? [newId] : []), function (id) {
                return dom.byId(id, this.ownerDocument);
            }, this);
            this._connections = array.map(this._connectIds, function (id) {
                var node = dom.byId(id, this.ownerDocument), selector = this.selector, delegatedEvent = selector ? function (eventType) {
                    return on.selector(selector, eventType);
                } : function (eventType) {
                    return eventType;
                }, self = this;
                return [on(node, delegatedEvent(mouse.enter), function () {
                    self._onHover(this);
                }), on(node, delegatedEvent("focusin"), function () {
                    self._onHover(this);
                }), on(node, delegatedEvent(mouse.leave), lang.hitch(self, "_onUnHover")), on(node, delegatedEvent("focusout"), lang.hitch(self, "_onUnHover"))];
            }, this);
            this._set("connectId", newId);
        }, addTarget:function (node) {
            var id = node.id || node;
            if (array.indexOf(this._connectIds, id) == -1) {
                this.set("connectId", this._connectIds.concat(id));
            }
        }, removeTarget:function (node) {
            var id = node.id || node, idx = array.indexOf(this._connectIds, id);
            if (idx >= 0) {
                this._connectIds.splice(idx, 1);
                this.set("connectId", this._connectIds);
            }
        }, buildRendering:function () {
            this.inherited(arguments);
            domClass.add(this.domNode, "dijitTooltipData");
        }, startup:function () {
            this.inherited(arguments);
            var ids = this.connectId;
            array.forEach(lang.isArrayLike(ids) ? ids : [ids], this.addTarget, this);
        }, getContent:function (node) {
            return this.label || this.domNode.innerHTML;
        }, _onHover:function (target) {
            if (!this._showTimer) {
                this._showTimer = this.defer(function () {
                    this.open(target);
                }, this.showDelay);
            }
        }, _onUnHover:function () {
            if (this._showTimer) {
                this._showTimer.remove();
                delete this._showTimer;
            }
            this.close();
        }, open:function (target) {
            if (this._showTimer) {
                this._showTimer.remove();
                delete this._showTimer;
            }
            var content = this.getContent(target);
            if (!content) {
                return;
            }
            Tooltip.show(content, target, this.position, !this.isLeftToRight(), this.textDir);
            this._connectNode = target;
            this.onShow(target, this.position);
        }, close:function () {
            if (this._connectNode) {
                Tooltip.hide(this._connectNode);
                delete this._connectNode;
                this.onHide();
            }
            if (this._showTimer) {
                this._showTimer.remove();
                delete this._showTimer;
            }
        }, onShow:function () {
        }, onHide:function () {
        }, destroy:function () {
            this.close();
            array.forEach(this._connections || [], function (nested) {
                array.forEach(nested, function (handle) {
                    handle.remove();
                });
            }, this);
            this.inherited(arguments);
        }});
        Tooltip._MasterTooltip = MasterTooltip;
        Tooltip.show = dijit.showTooltip;
        Tooltip.hide = dijit.hideTooltip;
        Tooltip.defaultPosition = ["after-centered", "before-centered"];
        return Tooltip;
    });
}, "dojo/_base/fx":function () {
    define("dojo/_base/fx", ["./kernel", "./config", "./lang", "../Evented", "./Color", "./connect", "./sniff", "../dom", "../dom-style"], function (dojo, config, lang, Evented, Color, connect, has, dom, style) {
        var _mixin = lang.mixin;
        var basefx = {};
        var _Line = basefx._Line = function (start, end) {
            this.start = start;
            this.end = end;
        };
        _Line.prototype.getValue = function (n) {
            return ((this.end - this.start) * n) + this.start;
        };
        var Animation = basefx.Animation = function (args) {
            _mixin(this, args);
            if (lang.isArray(this.curve)) {
                this.curve = new _Line(this.curve[0], this.curve[1]);
            }
        };
        Animation.prototype = new Evented();
        lang.extend(Animation, {duration:350, repeat:0, rate:20, _percent:0, _startRepeatCount:0, _getStep:function () {
            var _p = this._percent, _e = this.easing;
            return _e ? _e(_p) : _p;
        }, _fire:function (evt, args) {
            var a = args || [];
            if (this[evt]) {
                if (config.debugAtAllCosts) {
                    this[evt].apply(this, a);
                } else {
                    try {
                        this[evt].apply(this, a);
                    }
                    catch (e) {
                        console.error("exception in animation handler for:", evt);
                        console.error(e);
                    }
                }
            }
            return this;
        }, play:function (delay, gotoStart) {
            var _t = this;
            if (_t._delayTimer) {
                _t._clearTimer();
            }
            if (gotoStart) {
                _t._stopTimer();
                _t._active = _t._paused = false;
                _t._percent = 0;
            } else {
                if (_t._active && !_t._paused) {
                    return _t;
                }
            }
            _t._fire("beforeBegin", [_t.node]);
            var de = delay || _t.delay, _p = lang.hitch(_t, "_play", gotoStart);
            if (de > 0) {
                _t._delayTimer = setTimeout(_p, de);
                return _t;
            }
            _p();
            return _t;
        }, _play:function (gotoStart) {
            var _t = this;
            if (_t._delayTimer) {
                _t._clearTimer();
            }
            _t._startTime = new Date().valueOf();
            if (_t._paused) {
                _t._startTime -= _t.duration * _t._percent;
            }
            _t._active = true;
            _t._paused = false;
            var value = _t.curve.getValue(_t._getStep());
            if (!_t._percent) {
                if (!_t._startRepeatCount) {
                    _t._startRepeatCount = _t.repeat;
                }
                _t._fire("onBegin", [value]);
            }
            _t._fire("onPlay", [value]);
            _t._cycle();
            return _t;
        }, pause:function () {
            var _t = this;
            if (_t._delayTimer) {
                _t._clearTimer();
            }
            _t._stopTimer();
            if (!_t._active) {
                return _t;
            }
            _t._paused = true;
            _t._fire("onPause", [_t.curve.getValue(_t._getStep())]);
            return _t;
        }, gotoPercent:function (percent, andPlay) {
            var _t = this;
            _t._stopTimer();
            _t._active = _t._paused = true;
            _t._percent = percent;
            if (andPlay) {
                _t.play();
            }
            return _t;
        }, stop:function (gotoEnd) {
            var _t = this;
            if (_t._delayTimer) {
                _t._clearTimer();
            }
            if (!_t._timer) {
                return _t;
            }
            _t._stopTimer();
            if (gotoEnd) {
                _t._percent = 1;
            }
            _t._fire("onStop", [_t.curve.getValue(_t._getStep())]);
            _t._active = _t._paused = false;
            return _t;
        }, status:function () {
            if (this._active) {
                return this._paused ? "paused" : "playing";
            }
            return "stopped";
        }, _cycle:function () {
            var _t = this;
            if (_t._active) {
                var curr = new Date().valueOf();
                var step = _t.duration === 0 ? 1 : (curr - _t._startTime) / (_t.duration);
                if (step >= 1) {
                    step = 1;
                }
                _t._percent = step;
                if (_t.easing) {
                    step = _t.easing(step);
                }
                _t._fire("onAnimate", [_t.curve.getValue(step)]);
                if (_t._percent < 1) {
                    _t._startTimer();
                } else {
                    _t._active = false;
                    if (_t.repeat > 0) {
                        _t.repeat--;
                        _t.play(null, true);
                    } else {
                        if (_t.repeat == -1) {
                            _t.play(null, true);
                        } else {
                            if (_t._startRepeatCount) {
                                _t.repeat = _t._startRepeatCount;
                                _t._startRepeatCount = 0;
                            }
                        }
                    }
                    _t._percent = 0;
                    _t._fire("onEnd", [_t.node]);
                    !_t.repeat && _t._stopTimer();
                }
            }
            return _t;
        }, _clearTimer:function () {
            clearTimeout(this._delayTimer);
            delete this._delayTimer;
        }});
        var ctr = 0, timer = null, runner = {run:function () {
        }};
        lang.extend(Animation, {_startTimer:function () {
            if (!this._timer) {
                this._timer = connect.connect(runner, "run", this, "_cycle");
                ctr++;
            }
            if (!timer) {
                timer = setInterval(lang.hitch(runner, "run"), this.rate);
            }
        }, _stopTimer:function () {
            if (this._timer) {
                connect.disconnect(this._timer);
                this._timer = null;
                ctr--;
            }
            if (ctr <= 0) {
                clearInterval(timer);
                timer = null;
                ctr = 0;
            }
        }});
        var _makeFadeable = has("ie") ? function (node) {
            var ns = node.style;
            if (!ns.width.length && style.get(node, "width") == "auto") {
                ns.width = "auto";
            }
        } : function () {
        };
        basefx._fade = function (args) {
            args.node = dom.byId(args.node);
            var fArgs = _mixin({properties:{}}, args), props = (fArgs.properties.opacity = {});
            props.start = !("start" in fArgs) ? function () {
                return +style.get(fArgs.node, "opacity") || 0;
            } : fArgs.start;
            props.end = fArgs.end;
            var anim = basefx.animateProperty(fArgs);
            connect.connect(anim, "beforeBegin", lang.partial(_makeFadeable, fArgs.node));
            return anim;
        };
        basefx.fadeIn = function (args) {
            return basefx._fade(_mixin({end:1}, args));
        };
        basefx.fadeOut = function (args) {
            return basefx._fade(_mixin({end:0}, args));
        };
        basefx._defaultEasing = function (n) {
            return 0.5 + ((Math.sin((n + 1.5) * Math.PI)) / 2);
        };
        var PropLine = function (properties) {
            this._properties = properties;
            for (var p in properties) {
                var prop = properties[p];
                if (prop.start instanceof Color) {
                    prop.tempColor = new Color();
                }
            }
        };
        PropLine.prototype.getValue = function (r) {
            var ret = {};
            for (var p in this._properties) {
                var prop = this._properties[p], start = prop.start;
                if (start instanceof Color) {
                    ret[p] = Color.blendColors(start, prop.end, r, prop.tempColor).toCss();
                } else {
                    if (!lang.isArray(start)) {
                        ret[p] = ((prop.end - start) * r) + start + (p != "opacity" ? prop.units || "px" : 0);
                    }
                }
            }
            return ret;
        };
        basefx.animateProperty = function (args) {
            var n = args.node = dom.byId(args.node);
            if (!args.easing) {
                args.easing = dojo._defaultEasing;
            }
            var anim = new Animation(args);
            connect.connect(anim, "beforeBegin", anim, function () {
                var pm = {};
                for (var p in this.properties) {
                    if (p == "width" || p == "height") {
                        this.node.display = "block";
                    }
                    var prop = this.properties[p];
                    if (lang.isFunction(prop)) {
                        prop = prop(n);
                    }
                    prop = pm[p] = _mixin({}, (lang.isObject(prop) ? prop : {end:prop}));
                    if (lang.isFunction(prop.start)) {
                        prop.start = prop.start(n);
                    }
                    if (lang.isFunction(prop.end)) {
                        prop.end = prop.end(n);
                    }
                    var isColor = (p.toLowerCase().indexOf("color") >= 0);
                    function getStyle(node, p) {
                        var v = {height:node.offsetHeight, width:node.offsetWidth}[p];
                        if (v !== undefined) {
                            return v;
                        }
                        v = style.get(node, p);
                        return (p == "opacity") ? +v : (isColor ? v : parseFloat(v));
                    }
                    if (!("end" in prop)) {
                        prop.end = getStyle(n, p);
                    } else {
                        if (!("start" in prop)) {
                            prop.start = getStyle(n, p);
                        }
                    }
                    if (isColor) {
                        prop.start = new Color(prop.start);
                        prop.end = new Color(prop.end);
                    } else {
                        prop.start = (p == "opacity") ? +prop.start : parseFloat(prop.start);
                    }
                }
                this.curve = new PropLine(pm);
            });
            connect.connect(anim, "onAnimate", lang.hitch(style, "set", anim.node));
            return anim;
        };
        basefx.anim = function (node, properties, duration, easing, onEnd, delay) {
            return basefx.animateProperty({node:node, duration:duration || Animation.prototype.duration, properties:properties, easing:easing, onEnd:onEnd}).play(delay || 0);
        };
        if (1) {
            _mixin(dojo, basefx);
            dojo._Animation = Animation;
        }
        return basefx;
    });
}, "dojo/_base/Color":function () {
    define("dojo/_base/Color", ["./kernel", "./lang", "./array", "./config"], function (dojo, lang, ArrayUtil, config) {
        var Color = dojo.Color = function (color) {
            if (color) {
                this.setColor(color);
            }
        };
        Color.named = {"black":[0, 0, 0], "silver":[192, 192, 192], "gray":[128, 128, 128], "white":[255, 255, 255], "maroon":[128, 0, 0], "red":[255, 0, 0], "purple":[128, 0, 128], "fuchsia":[255, 0, 255], "green":[0, 128, 0], "lime":[0, 255, 0], "olive":[128, 128, 0], "yellow":[255, 255, 0], "navy":[0, 0, 128], "blue":[0, 0, 255], "teal":[0, 128, 128], "aqua":[0, 255, 255], "transparent":config.transparentColor || [0, 0, 0, 0]};
        lang.extend(Color, {r:255, g:255, b:255, a:1, _set:function (r, g, b, a) {
            var t = this;
            t.r = r;
            t.g = g;
            t.b = b;
            t.a = a;
        }, setColor:function (color) {
            if (lang.isString(color)) {
                Color.fromString(color, this);
            } else {
                if (lang.isArray(color)) {
                    Color.fromArray(color, this);
                } else {
                    this._set(color.r, color.g, color.b, color.a);
                    if (!(color instanceof Color)) {
                        this.sanitize();
                    }
                }
            }
            return this;
        }, sanitize:function () {
            return this;
        }, toRgb:function () {
            var t = this;
            return [t.r, t.g, t.b];
        }, toRgba:function () {
            var t = this;
            return [t.r, t.g, t.b, t.a];
        }, toHex:function () {
            var arr = ArrayUtil.map(["r", "g", "b"], function (x) {
                var s = this[x].toString(16);
                return s.length < 2 ? "0" + s : s;
            }, this);
            return "#" + arr.join("");
        }, toCss:function (includeAlpha) {
            var t = this, rgb = t.r + ", " + t.g + ", " + t.b;
            return (includeAlpha ? "rgba(" + rgb + ", " + t.a : "rgb(" + rgb) + ")";
        }, toString:function () {
            return this.toCss(true);
        }});
        Color.blendColors = dojo.blendColors = function (start, end, weight, obj) {
            var t = obj || new Color();
            ArrayUtil.forEach(["r", "g", "b", "a"], function (x) {
                t[x] = start[x] + (end[x] - start[x]) * weight;
                if (x != "a") {
                    t[x] = Math.round(t[x]);
                }
            });
            return t.sanitize();
        };
        Color.fromRgb = dojo.colorFromRgb = function (color, obj) {
            var m = color.toLowerCase().match(/^rgba?\(([\s\.,0-9]+)\)/);
            return m && Color.fromArray(m[1].split(/\s*,\s*/), obj);
        };
        Color.fromHex = dojo.colorFromHex = function (color, obj) {
            var t = obj || new Color(), bits = (color.length == 4) ? 4 : 8, mask = (1 << bits) - 1;
            color = Number("0x" + color.substr(1));
            if (isNaN(color)) {
                return null;
            }
            ArrayUtil.forEach(["b", "g", "r"], function (x) {
                var c = color & mask;
                color >>= bits;
                t[x] = bits == 4 ? 17 * c : c;
            });
            t.a = 1;
            return t;
        };
        Color.fromArray = dojo.colorFromArray = function (a, obj) {
            var t = obj || new Color();
            t._set(Number(a[0]), Number(a[1]), Number(a[2]), Number(a[3]));
            if (isNaN(t.a)) {
                t.a = 1;
            }
            return t.sanitize();
        };
        Color.fromString = dojo.colorFromString = function (str, obj) {
            var a = Color.named[str];
            return a && Color.fromArray(a, obj) || Color.fromRgb(str, obj) || Color.fromHex(str, obj);
        };
        return Color;
    });
}, "dojo/dom-class":function () {
    define("dojo/dom-class", ["./_base/lang", "./_base/array", "./dom"], function (lang, array, dom) {
        var className = "className";
        var cls, spaces = /\s+/, a1 = [""];
        function str2array(s) {
            if (typeof s == "string" || s instanceof String) {
                if (s && !spaces.test(s)) {
                    a1[0] = s;
                    return a1;
                }
                var a = s.split(spaces);
                if (a.length && !a[0]) {
                    a.shift();
                }
                if (a.length && !a[a.length - 1]) {
                    a.pop();
                }
                return a;
            }
            if (!s) {
                return [];
            }
            return array.filter(s, function (x) {
                return x;
            });
        }
        var fakeNode = {};
        cls = {contains:function containsClass(node, classStr) {
            return ((" " + dom.byId(node)[className] + " ").indexOf(" " + classStr + " ") >= 0);
        }, add:function addClass(node, classStr) {
            node = dom.byId(node);
            classStr = str2array(classStr);
            var cls = node[className], oldLen;
            cls = cls ? " " + cls + " " : " ";
            oldLen = cls.length;
            for (var i = 0, len = classStr.length, c; i < len; ++i) {
                c = classStr[i];
                if (c && cls.indexOf(" " + c + " ") < 0) {
                    cls += c + " ";
                }
            }
            if (oldLen < cls.length) {
                node[className] = cls.substr(1, cls.length - 2);
            }
        }, remove:function removeClass(node, classStr) {
            node = dom.byId(node);
            var cls;
            if (classStr !== undefined) {
                classStr = str2array(classStr);
                cls = " " + node[className] + " ";
                for (var i = 0, len = classStr.length; i < len; ++i) {
                    cls = cls.replace(" " + classStr[i] + " ", " ");
                }
                cls = lang.trim(cls);
            } else {
                cls = "";
            }
            if (node[className] != cls) {
                node[className] = cls;
            }
        }, replace:function replaceClass(node, addClassStr, removeClassStr) {
            node = dom.byId(node);
            fakeNode[className] = node[className];
            cls.remove(fakeNode, removeClassStr);
            cls.add(fakeNode, addClassStr);
            if (node[className] !== fakeNode[className]) {
                node[className] = fakeNode[className];
            }
        }, toggle:function toggleClass(node, classStr, condition) {
            node = dom.byId(node);
            if (condition === undefined) {
                classStr = str2array(classStr);
                for (var i = 0, len = classStr.length, c; i < len; ++i) {
                    c = classStr[i];
                    cls[cls.contains(node, c) ? "remove" : "add"](node, c);
                }
            } else {
                cls[condition ? "add" : "remove"](node, classStr);
            }
            return condition;
        }};
        return cls;
    });
}, "dijit/_base/manager":function () {
    define("dijit/_base/manager", ["dojo/_base/array", "dojo/_base/config", "dojo/_base/lang", "../registry", "../main"], function (array, config, lang, registry, dijit) {
        var exports = {};
        array.forEach(["byId", "getUniqueId", "findWidgets", "_destroyAll", "byNode", "getEnclosingWidget"], function (name) {
            exports[name] = registry[name];
        });
        lang.mixin(exports, {defaultDuration:config["defaultDuration"] || 200});
        lang.mixin(dijit, exports);
        return dijit;
    });
}, "dijit/registry":function () {
    define("dijit/registry", ["dojo/_base/array", "dojo/sniff", "dojo/_base/unload", "dojo/_base/window", "./main"], function (array, has, unload, win, dijit) {
        var _widgetTypeCtr = {}, hash = {};
        var registry = {length:0, add:function (widget) {
            if (hash[widget.id]) {
                throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
            }
            hash[widget.id] = widget;
            this.length++;
        }, remove:function (id) {
            if (hash[id]) {
                delete hash[id];
                this.length--;
            }
        }, byId:function (id) {
            return typeof id == "string" ? hash[id] : id;
        }, byNode:function (node) {
            return hash[node.getAttribute("widgetId")];
        }, toArray:function () {
            var ar = [];
            for (var id in hash) {
                ar.push(hash[id]);
            }
            return ar;
        }, getUniqueId:function (widgetType) {
            var id;
            do {
                id = widgetType + "_" + (widgetType in _widgetTypeCtr ? ++_widgetTypeCtr[widgetType] : _widgetTypeCtr[widgetType] = 0);
            } while (hash[id]);
            return dijit._scopeName == "dijit" ? id : dijit._scopeName + "_" + id;
        }, findWidgets:function (root, skipNode) {
            var outAry = [];
            function getChildrenHelper(root) {
                for (var node = root.firstChild; node; node = node.nextSibling) {
                    if (node.nodeType == 1) {
                        var widgetId = node.getAttribute("widgetId");
                        if (widgetId) {
                            var widget = hash[widgetId];
                            if (widget) {
                                outAry.push(widget);
                            }
                        } else {
                            if (node !== skipNode) {
                                getChildrenHelper(node);
                            }
                        }
                    }
                }
            }
            getChildrenHelper(root);
            return outAry;
        }, _destroyAll:function () {
            dijit._curFocus = null;
            dijit._prevFocus = null;
            dijit._activeStack = [];
            array.forEach(registry.findWidgets(win.body()), function (widget) {
                if (!widget._destroyed) {
                    if (widget.destroyRecursive) {
                        widget.destroyRecursive();
                    } else {
                        if (widget.destroy) {
                            widget.destroy();
                        }
                    }
                }
            });
        }, getEnclosingWidget:function (node) {
            while (node) {
                var id = node.getAttribute && node.getAttribute("widgetId");
                if (id) {
                    return hash[id];
                }
                node = node.parentNode;
            }
            return null;
        }, _hash:hash};
        dijit.registry = registry;
        return registry;
    });
}, "dojo/_base/unload":function () {
    define("dojo/_base/unload", ["./kernel", "./lang", "../on"], function (dojo, lang, on) {
        var win = window;
        var unload = {addOnWindowUnload:function (obj, functionName) {
            if (!dojo.windowUnloaded) {
                on(win, "unload", (dojo.windowUnloaded = function () {
                }));
            }
            on(win, "unload", lang.hitch(obj, functionName));
        }, addOnUnload:function (obj, functionName) {
            on(win, "beforeunload", lang.hitch(obj, functionName));
        }};
        dojo.addOnWindowUnload = unload.addOnWindowUnload;
        dojo.addOnUnload = unload.addOnUnload;
        return unload;
    });
}, "dijit/main":function () {
    define("dijit/main", ["dojo/_base/kernel"], function (dojo) {
        return dojo.dijit;
    });
}, "dijit/place":function () {
    define("dijit/place", ["dojo/_base/array", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/kernel", "dojo/_base/window", "dojo/window", "./main"], function (array, domGeometry, domStyle, kernel, win, winUtils, dijit) {
        function _place(node, choices, layoutNode, aroundNodeCoords) {
            var view = winUtils.getBox(node.ownerDocument);
            if (!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body") {
                win.body(node.ownerDocument).appendChild(node);
            }
            var best = null;
            array.some(choices, function (choice) {
                var corner = choice.corner;
                var pos = choice.pos;
                var overflow = 0;
                var spaceAvailable = {w:{"L":view.l + view.w - pos.x, "R":pos.x - view.l, "M":view.w}[corner.charAt(1)], h:{"T":view.t + view.h - pos.y, "B":pos.y - view.t, "M":view.h}[corner.charAt(0)]};
                var s = node.style;
                s.left = s.right = "auto";
                if (layoutNode) {
                    var res = layoutNode(node, choice.aroundCorner, corner, spaceAvailable, aroundNodeCoords);
                    overflow = typeof res == "undefined" ? 0 : res;
                }
                var style = node.style;
                var oldDisplay = style.display;
                var oldVis = style.visibility;
                if (style.display == "none") {
                    style.visibility = "hidden";
                    style.display = "";
                }
                var bb = domGeometry.position(node);
                style.display = oldDisplay;
                style.visibility = oldVis;
                var startXpos = {"L":pos.x, "R":pos.x - bb.w, "M":Math.max(view.l, Math.min(view.l + view.w, pos.x + (bb.w >> 1)) - bb.w)}[corner.charAt(1)], startYpos = {"T":pos.y, "B":pos.y - bb.h, "M":Math.max(view.t, Math.min(view.t + view.h, pos.y + (bb.h >> 1)) - bb.h)}[corner.charAt(0)], startX = Math.max(view.l, startXpos), startY = Math.max(view.t, startYpos), endX = Math.min(view.l + view.w, startXpos + bb.w), endY = Math.min(view.t + view.h, startYpos + bb.h), width = endX - startX, height = endY - startY;
                overflow += (bb.w - width) + (bb.h - height);
                if (best == null || overflow < best.overflow) {
                    best = {corner:corner, aroundCorner:choice.aroundCorner, x:startX, y:startY, w:width, h:height, overflow:overflow, spaceAvailable:spaceAvailable};
                }
                return !overflow;
            });
            if (best.overflow && layoutNode) {
                layoutNode(node, best.aroundCorner, best.corner, best.spaceAvailable, aroundNodeCoords);
            }
            var l = domGeometry.isBodyLtr(node.ownerDocument), s = node.style;
            s.top = best.y + "px";
            s[l ? "left" : "right"] = (l ? best.x : view.w - best.x - best.w) + "px";
            s[l ? "right" : "left"] = "auto";
            return best;
        }
        var place = {at:function (node, pos, corners, padding) {
            var choices = array.map(corners, function (corner) {
                var c = {corner:corner, pos:{x:pos.x, y:pos.y}};
                if (padding) {
                    c.pos.x += corner.charAt(1) == "L" ? padding.x : -padding.x;
                    c.pos.y += corner.charAt(0) == "T" ? padding.y : -padding.y;
                }
                return c;
            });
            return _place(node, choices);
        }, around:function (node, anchor, positions, leftToRight, layoutNode) {
            var aroundNodePos = (typeof anchor == "string" || "offsetWidth" in anchor) ? domGeometry.position(anchor, true) : anchor;
            if (anchor.parentNode) {
                var sawPosAbsolute = domStyle.getComputedStyle(anchor).position == "absolute";
                var parent = anchor.parentNode;
                while (parent && parent.nodeType == 1 && parent.nodeName != "BODY") {
                    var parentPos = domGeometry.position(parent, true), pcs = domStyle.getComputedStyle(parent);
                    if (/relative|absolute/.test(pcs.position)) {
                        sawPosAbsolute = false;
                    }
                    if (!sawPosAbsolute && /hidden|auto|scroll/.test(pcs.overflow)) {
                        var bottomYCoord = Math.min(aroundNodePos.y + aroundNodePos.h, parentPos.y + parentPos.h);
                        var rightXCoord = Math.min(aroundNodePos.x + aroundNodePos.w, parentPos.x + parentPos.w);
                        aroundNodePos.x = Math.max(aroundNodePos.x, parentPos.x);
                        aroundNodePos.y = Math.max(aroundNodePos.y, parentPos.y);
                        aroundNodePos.h = bottomYCoord - aroundNodePos.y;
                        aroundNodePos.w = rightXCoord - aroundNodePos.x;
                    }
                    if (pcs.position == "absolute") {
                        sawPosAbsolute = true;
                    }
                    parent = parent.parentNode;
                }
            }
            var x = aroundNodePos.x, y = aroundNodePos.y, width = "w" in aroundNodePos ? aroundNodePos.w : (aroundNodePos.w = aroundNodePos.width), height = "h" in aroundNodePos ? aroundNodePos.h : (kernel.deprecated("place.around: dijit/place.__Rectangle: { x:" + x + ", y:" + y + ", height:" + aroundNodePos.height + ", width:" + width + " } has been deprecated.  Please use { x:" + x + ", y:" + y + ", h:" + aroundNodePos.height + ", w:" + width + " }", "", "2.0"), aroundNodePos.h = aroundNodePos.height);
            var choices = [];
            function push(aroundCorner, corner) {
                choices.push({aroundCorner:aroundCorner, corner:corner, pos:{x:{"L":x, "R":x + width, "M":x + (width >> 1)}[aroundCorner.charAt(1)], y:{"T":y, "B":y + height, "M":y + (height >> 1)}[aroundCorner.charAt(0)]}});
            }
            array.forEach(positions, function (pos) {
                var ltr = leftToRight;
                switch (pos) {
                  case "above-centered":
                    push("TM", "BM");
                    break;
                  case "below-centered":
                    push("BM", "TM");
                    break;
                  case "after-centered":
                    ltr = !ltr;
                  case "before-centered":
                    push(ltr ? "ML" : "MR", ltr ? "MR" : "ML");
                    break;
                  case "after":
                    ltr = !ltr;
                  case "before":
                    push(ltr ? "TL" : "TR", ltr ? "TR" : "TL");
                    push(ltr ? "BL" : "BR", ltr ? "BR" : "BL");
                    break;
                  case "below-alt":
                    ltr = !ltr;
                  case "below":
                    push(ltr ? "BL" : "BR", ltr ? "TL" : "TR");
                    push(ltr ? "BR" : "BL", ltr ? "TR" : "TL");
                    break;
                  case "above-alt":
                    ltr = !ltr;
                  case "above":
                    push(ltr ? "TL" : "TR", ltr ? "BL" : "BR");
                    push(ltr ? "TR" : "TL", ltr ? "BR" : "BL");
                    break;
                  default:
                    push(pos.aroundCorner, pos.corner);
                }
            });
            var position = _place(node, choices, layoutNode, {w:width, h:height});
            position.aroundNodePos = aroundNodePos;
            return position;
        }};
        return dijit.place = place;
    });
}, "dojo/window":function () {
    define("dojo/window", ["./_base/lang", "./sniff", "./_base/window", "./dom", "./dom-geometry", "./dom-style"], function (lang, has, baseWindow, dom, geom, style) {
        var window = {getBox:function (doc) {
            doc = doc || baseWindow.doc;
            var scrollRoot = (doc.compatMode == "BackCompat") ? baseWindow.body(doc) : doc.documentElement, scroll = geom.docScroll(doc), w, h;
            if (has("touch")) {
                var uiWindow = window.get(doc);
                w = uiWindow.innerWidth || scrollRoot.clientWidth;
                h = uiWindow.innerHeight || scrollRoot.clientHeight;
            } else {
                w = scrollRoot.clientWidth;
                h = scrollRoot.clientHeight;
            }
            return {l:scroll.x, t:scroll.y, w:w, h:h};
        }, get:function (doc) {
            if (has("ie") && window !== document.parentWindow) {
                doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
                var win = doc._parentWindow;
                doc._parentWindow = null;
                return win;
            }
            return doc.parentWindow || doc.defaultView;
        }, scrollIntoView:function (node, pos) {
            try {
                node = dom.byId(node);
                var doc = node.ownerDocument || baseWindow.doc, body = baseWindow.body(doc), html = doc.documentElement || body.parentNode, isIE = has("ie"), isWK = has("webkit");
                if ((!(has("mozilla") || isIE || isWK || has("opera")) || node == body || node == html) && (typeof node.scrollIntoView != "undefined")) {
                    node.scrollIntoView(false);
                    return;
                }
                var backCompat = doc.compatMode == "BackCompat", clientAreaRoot = (isIE >= 9 && "frameElement" in node.ownerDocument.parentWindow) ? ((html.clientHeight > 0 && html.clientWidth > 0 && (body.clientHeight == 0 || body.clientWidth == 0 || body.clientHeight > html.clientHeight || body.clientWidth > html.clientWidth)) ? html : body) : (backCompat ? body : html), scrollRoot = isWK ? body : clientAreaRoot, rootWidth = clientAreaRoot.clientWidth, rootHeight = clientAreaRoot.clientHeight, rtl = !geom.isBodyLtr(doc), nodePos = pos || geom.position(node), el = node.parentNode, isFixed = function (el) {
                    return ((isIE <= 6 || (isIE && backCompat)) ? false : (style.get(el, "position").toLowerCase() == "fixed"));
                };
                if (isFixed(node)) {
                    return;
                }
                while (el) {
                    if (el == body) {
                        el = scrollRoot;
                    }
                    var elPos = geom.position(el), fixedPos = isFixed(el);
                    if (el == scrollRoot) {
                        elPos.w = rootWidth;
                        elPos.h = rootHeight;
                        if (scrollRoot == html && isIE && rtl) {
                            elPos.x += scrollRoot.offsetWidth - elPos.w;
                        }
                        if (elPos.x < 0 || !isIE) {
                            elPos.x = 0;
                        }
                        if (elPos.y < 0 || !isIE) {
                            elPos.y = 0;
                        }
                    } else {
                        var pb = geom.getPadBorderExtents(el);
                        elPos.w -= pb.w;
                        elPos.h -= pb.h;
                        elPos.x += pb.l;
                        elPos.y += pb.t;
                        var clientSize = el.clientWidth, scrollBarSize = elPos.w - clientSize;
                        if (clientSize > 0 && scrollBarSize > 0) {
                            elPos.w = clientSize;
                            elPos.x += (rtl && (isIE || el.clientLeft > pb.l)) ? scrollBarSize : 0;
                        }
                        clientSize = el.clientHeight;
                        scrollBarSize = elPos.h - clientSize;
                        if (clientSize > 0 && scrollBarSize > 0) {
                            elPos.h = clientSize;
                        }
                    }
                    if (fixedPos) {
                        if (elPos.y < 0) {
                            elPos.h += elPos.y;
                            elPos.y = 0;
                        }
                        if (elPos.x < 0) {
                            elPos.w += elPos.x;
                            elPos.x = 0;
                        }
                        if (elPos.y + elPos.h > rootHeight) {
                            elPos.h = rootHeight - elPos.y;
                        }
                        if (elPos.x + elPos.w > rootWidth) {
                            elPos.w = rootWidth - elPos.x;
                        }
                    }
                    var l = nodePos.x - elPos.x, t = nodePos.y - Math.max(elPos.y, 0), r = l + nodePos.w - elPos.w, bot = t + nodePos.h - elPos.h;
                    if (r * l > 0) {
                        var s = Math[l < 0 ? "max" : "min"](l, r);
                        if (rtl && ((isIE == 8 && !backCompat) || isIE >= 9)) {
                            s = -s;
                        }
                        nodePos.x += el.scrollLeft;
                        el.scrollLeft += s;
                        nodePos.x -= el.scrollLeft;
                    }
                    if (bot * t > 0) {
                        nodePos.y += el.scrollTop;
                        el.scrollTop += Math[t < 0 ? "max" : "min"](t, bot);
                        nodePos.y -= el.scrollTop;
                    }
                    el = (el != scrollRoot) && !fixedPos && el.parentNode;
                }
            }
            catch (error) {
                console.error("scrollIntoView: " + error);
                node.scrollIntoView(false);
            }
        }};
        1 && lang.setObject("dojo.window", window);
        return window;
    });
}, "dijit/_Widget":function () {
    define("dijit/_Widget", ["dojo/aspect", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/declare", "dojo/has", "dojo/_base/kernel", "dojo/_base/lang", "dojo/query", "dojo/ready", "./registry", "./_WidgetBase", "./_OnDijitClickMixin", "./_FocusMixin", "dojo/uacss", "./hccss"], function (aspect, config, connect, declare, has, kernel, lang, query, ready, registry, _WidgetBase, _OnDijitClickMixin, _FocusMixin) {
        function connectToDomNode() {
        }
        function aroundAdvice(originalConnect) {
            return function (obj, event, scope, method) {
                if (obj && typeof event == "string" && obj[event] == connectToDomNode) {
                    return obj.on(event.substring(2).toLowerCase(), lang.hitch(scope, method));
                }
                return originalConnect.apply(connect, arguments);
            };
        }
        aspect.around(connect, "connect", aroundAdvice);
        if (kernel.connect) {
            aspect.around(kernel, "connect", aroundAdvice);
        }
        var _Widget = declare("dijit._Widget", [_WidgetBase, _OnDijitClickMixin, _FocusMixin], {onClick:connectToDomNode, onDblClick:connectToDomNode, onKeyDown:connectToDomNode, onKeyPress:connectToDomNode, onKeyUp:connectToDomNode, onMouseDown:connectToDomNode, onMouseMove:connectToDomNode, onMouseOut:connectToDomNode, onMouseOver:connectToDomNode, onMouseLeave:connectToDomNode, onMouseEnter:connectToDomNode, onMouseUp:connectToDomNode, constructor:function (params) {
            this._toConnect = {};
            for (var name in params) {
                if (this[name] === connectToDomNode) {
                    this._toConnect[name.replace(/^on/, "").toLowerCase()] = params[name];
                    delete params[name];
                }
            }
        }, postCreate:function () {
            this.inherited(arguments);
            for (var name in this._toConnect) {
                this.on(name, this._toConnect[name]);
            }
            delete this._toConnect;
        }, on:function (type, func) {
            if (this[this._onMap(type)] === connectToDomNode) {
                return connect.connect(this.domNode, type.toLowerCase(), this, func);
            }
            return this.inherited(arguments);
        }, _setFocusedAttr:function (val) {
            this._focused = val;
            this._set("focused", val);
        }, setAttribute:function (attr, value) {
            kernel.deprecated(this.declaredClass + "::setAttribute(attr, value) is deprecated. Use set() instead.", "", "2.0");
            this.set(attr, value);
        }, attr:function (name, value) {
            if (config.isDebug) {
                var alreadyCalledHash = arguments.callee._ach || (arguments.callee._ach = {}), caller = (arguments.callee.caller || "unknown caller").toString();
                if (!alreadyCalledHash[caller]) {
                    kernel.deprecated(this.declaredClass + "::attr() is deprecated. Use get() or set() instead, called from " + caller, "", "2.0");
                    alreadyCalledHash[caller] = true;
                }
            }
            var args = arguments.length;
            if (args >= 2 || typeof name === "object") {
                return this.set.apply(this, arguments);
            } else {
                return this.get(name);
            }
        }, getDescendants:function () {
            kernel.deprecated(this.declaredClass + "::getDescendants() is deprecated. Use getChildren() instead.", "", "2.0");
            return this.containerNode ? query("[widgetId]", this.containerNode).map(registry.byNode) : [];
        }, _onShow:function () {
            this.onShow();
        }, onShow:function () {
        }, onHide:function () {
        }, onClose:function () {
            return true;
        }});
        if (has("dijit-legacy-requires")) {
            ready(0, function () {
                var requires = ["dijit/_base"];
                require(requires);
            });
        }
        return _Widget;
    });
}, "dojo/query":function () {
    define("dojo/query", ["./_base/kernel", "./has", "./dom", "./on", "./_base/array", "./_base/lang", "./selector/_loader", "./selector/_loader!default"], function (dojo, has, dom, on, array, lang, loader, defaultEngine) {
        "use strict";
        has.add("array-extensible", function () {
            return lang.delegate([], {length:1}).length == 1 && !has("bug-for-in-skips-shadowed");
        });
        var ap = Array.prototype, aps = ap.slice, apc = ap.concat, forEach = array.forEach;
        var tnl = function (a, parent, NodeListCtor) {
            var nodeList = new (NodeListCtor || this._NodeListCtor || nl)(a);
            return parent ? nodeList._stash(parent) : nodeList;
        };
        var loopBody = function (f, a, o) {
            a = [0].concat(aps.call(a, 0));
            o = o || dojo.global;
            return function (node) {
                a[0] = node;
                return f.apply(o, a);
            };
        };
        var adaptAsForEach = function (f, o) {
            return function () {
                this.forEach(loopBody(f, arguments, o));
                return this;
            };
        };
        var adaptAsMap = function (f, o) {
            return function () {
                return this.map(loopBody(f, arguments, o));
            };
        };
        var adaptAsFilter = function (f, o) {
            return function () {
                return this.filter(loopBody(f, arguments, o));
            };
        };
        var adaptWithCondition = function (f, g, o) {
            return function () {
                var a = arguments, body = loopBody(f, a, o);
                if (g.call(o || dojo.global, a)) {
                    return this.map(body);
                }
                this.forEach(body);
                return this;
            };
        };
        var NodeList = function (array) {
            var isNew = this instanceof nl && has("array-extensible");
            if (typeof array == "number") {
                array = Array(array);
            }
            var nodeArray = (array && "length" in array) ? array : arguments;
            if (isNew || !nodeArray.sort) {
                var target = isNew ? this : [], l = target.length = nodeArray.length;
                for (var i = 0; i < l; i++) {
                    target[i] = nodeArray[i];
                }
                if (isNew) {
                    return target;
                }
                nodeArray = target;
            }
            lang._mixin(nodeArray, nlp);
            nodeArray._NodeListCtor = function (array) {
                return nl(array);
            };
            return nodeArray;
        };
        var nl = NodeList, nlp = nl.prototype = has("array-extensible") ? [] : {};
        nl._wrap = nlp._wrap = tnl;
        nl._adaptAsMap = adaptAsMap;
        nl._adaptAsForEach = adaptAsForEach;
        nl._adaptAsFilter = adaptAsFilter;
        nl._adaptWithCondition = adaptWithCondition;
        forEach(["slice", "splice"], function (name) {
            var f = ap[name];
            nlp[name] = function () {
                return this._wrap(f.apply(this, arguments), name == "slice" ? this : null);
            };
        });
        forEach(["indexOf", "lastIndexOf", "every", "some"], function (name) {
            var f = array[name];
            nlp[name] = function () {
                return f.apply(dojo, [this].concat(aps.call(arguments, 0)));
            };
        });
        lang.extend(NodeList, {constructor:nl, _NodeListCtor:nl, toString:function () {
            return this.join(",");
        }, _stash:function (parent) {
            this._parent = parent;
            return this;
        }, on:function (eventName, listener) {
            var handles = this.map(function (node) {
                return on(node, eventName, listener);
            });
            handles.remove = function () {
                for (var i = 0; i < handles.length; i++) {
                    handles[i].remove();
                }
            };
            return handles;
        }, end:function () {
            if (this._parent) {
                return this._parent;
            } else {
                return new this._NodeListCtor(0);
            }
        }, concat:function (item) {
            var t = aps.call(this, 0), m = array.map(arguments, function (a) {
                return aps.call(a, 0);
            });
            return this._wrap(apc.apply(t, m), this);
        }, map:function (func, obj) {
            return this._wrap(array.map(this, func, obj), this);
        }, forEach:function (callback, thisObj) {
            forEach(this, callback, thisObj);
            return this;
        }, filter:function (filter) {
            var a = arguments, items = this, start = 0;
            if (typeof filter == "string") {
                items = query._filterResult(this, a[0]);
                if (a.length == 1) {
                    return items._stash(this);
                }
                start = 1;
            }
            return this._wrap(array.filter(items, a[start], a[start + 1]), this);
        }, instantiate:function (declaredClass, properties) {
            var c = lang.isFunction(declaredClass) ? declaredClass : lang.getObject(declaredClass);
            properties = properties || {};
            return this.forEach(function (node) {
                new c(properties, node);
            });
        }, at:function () {
            var t = new this._NodeListCtor(0);
            forEach(arguments, function (i) {
                if (i < 0) {
                    i = this.length + i;
                }
                if (this[i]) {
                    t.push(this[i]);
                }
            }, this);
            return t._stash(this);
        }});
        function queryForEngine(engine, NodeList) {
            var query = function (query, root) {
                if (typeof root == "string") {
                    root = dom.byId(root);
                    if (!root) {
                        return new NodeList([]);
                    }
                }
                var results = typeof query == "string" ? engine(query, root) : query ? query.orphan ? query : [query] : [];
                if (results.orphan) {
                    return results;
                }
                return new NodeList(results);
            };
            query.matches = engine.match || function (node, selector, root) {
                return query.filter([node], selector, root).length > 0;
            };
            query.filter = engine.filter || function (nodes, selector, root) {
                return query(selector, root).filter(function (node) {
                    return array.indexOf(nodes, node) > -1;
                });
            };
            if (typeof engine != "function") {
                var search = engine.search;
                engine = function (selector, root) {
                    return search(root || document, selector);
                };
            }
            return query;
        }
        var query = queryForEngine(defaultEngine, NodeList);
        dojo.query = queryForEngine(defaultEngine, function (array) {
            return NodeList(array);
        });
        query.load = function (id, parentRequire, loaded) {
            loader.load(id, parentRequire, function (engine) {
                loaded(queryForEngine(engine, NodeList));
            });
        };
        dojo._filterQueryResult = query._filterResult = function (nodes, selector, root) {
            return new NodeList(query.filter(nodes, selector, root));
        };
        dojo.NodeList = query.NodeList = NodeList;
        return query;
    });
}, "dojo/selector/_loader":function () {
    define("dojo/selector/_loader", ["../has", "require"], function (has, require) {
        "use strict";
        var testDiv = document.createElement("div");
        has.add("dom-qsa2.1", !!testDiv.querySelectorAll);
        has.add("dom-qsa3", function () {
            try {
                testDiv.innerHTML = "<p class='TEST'></p>";
                return testDiv.querySelectorAll(".TEST:empty").length == 1;
            }
            catch (e) {
            }
        });
        var fullEngine;
        var acme = "./acme", lite = "./lite";
        return {load:function (id, parentRequire, loaded, config) {
            var req = require;
            id = id == "default" ? has("config-selectorEngine") || "css3" : id;
            id = id == "css2" || id == "lite" ? lite : id == "css2.1" ? has("dom-qsa2.1") ? lite : acme : id == "css3" ? has("dom-qsa3") ? lite : acme : id == "acme" ? acme : (req = parentRequire) && id;
            if (id.charAt(id.length - 1) == "?") {
                id = id.substring(0, id.length - 1);
                var optionalLoad = true;
            }
            if (optionalLoad && (has("dom-compliant-qsa") || fullEngine)) {
                return loaded(fullEngine);
            }
            req([id], function (engine) {
                if (id != "./lite") {
                    fullEngine = engine;
                }
                loaded(engine);
            });
        }};
    });
}, "dojo/selector/lite":function () {
    define("dojo/selector/lite", ["../has", "../_base/kernel"], function (has, dojo) {
        "use strict";
        var testDiv = document.createElement("div");
        var matchesSelector = testDiv.matchesSelector || testDiv.webkitMatchesSelector || testDiv.mozMatchesSelector || testDiv.msMatchesSelector || testDiv.oMatchesSelector;
        var querySelectorAll = testDiv.querySelectorAll;
        var unionSplit = /([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g;
        has.add("dom-matches-selector", !!matchesSelector);
        has.add("dom-qsa", !!querySelectorAll);
        var liteEngine = function (selector, root) {
            if (combine && selector.indexOf(",") > -1) {
                return combine(selector, root);
            }
            var doc = root ? root.ownerDocument || root : dojo.doc || document, match = (querySelectorAll ? /^([\w]*)#([\w\-]+$)|^(\.)([\w\-\*]+$)|^(\w+$)/ : /^([\w]*)#([\w\-]+)(?:\s+(.*))?$|(?:^|(>|.+\s+))([\w\-\*]+)(\S*$)/).exec(selector);
            root = root || doc;
            if (match) {
                if (match[2]) {
                    var found = dojo.byId ? dojo.byId(match[2]) : doc.getElementById(match[2]);
                    if (!found || (match[1] && match[1] != found.tagName.toLowerCase())) {
                        return [];
                    }
                    if (root != doc) {
                        var parent = found;
                        while (parent != root) {
                            parent = parent.parentNode;
                            if (!parent) {
                                return [];
                            }
                        }
                    }
                    return match[3] ? liteEngine(match[3], found) : [found];
                }
                if (match[3] && root.getElementsByClassName) {
                    return root.getElementsByClassName(match[4]);
                }
                var found;
                if (match[5]) {
                    found = root.getElementsByTagName(match[5]);
                    if (match[4] || match[6]) {
                        selector = (match[4] || "") + match[6];
                    } else {
                        return found;
                    }
                }
            }
            if (querySelectorAll) {
                if (root.nodeType === 1 && root.nodeName.toLowerCase() !== "object") {
                    return useRoot(root, selector, root.querySelectorAll);
                } else {
                    return root.querySelectorAll(selector);
                }
            } else {
                if (!found) {
                    found = root.getElementsByTagName("*");
                }
            }
            var results = [];
            for (var i = 0, l = found.length; i < l; i++) {
                var node = found[i];
                if (node.nodeType == 1 && jsMatchesSelector(node, selector, root)) {
                    results.push(node);
                }
            }
            return results;
        };
        var useRoot = function (context, query, method) {
            var oldContext = context, old = context.getAttribute("id"), nid = old || "__dojo__", hasParent = context.parentNode, relativeHierarchySelector = /^\s*[+~]/.test(query);
            if (relativeHierarchySelector && !hasParent) {
                return [];
            }
            if (!old) {
                context.setAttribute("id", nid);
            } else {
                nid = nid.replace(/'/g, "\\$&");
            }
            if (relativeHierarchySelector && hasParent) {
                context = context.parentNode;
            }
            var selectors = query.match(unionSplit);
            for (var i = 0; i < selectors.length; i++) {
                selectors[i] = "[id='" + nid + "'] " + selectors[i];
            }
            query = selectors.join(",");
            try {
                return method.call(context, query);
            }
            finally {
                if (!old) {
                    oldContext.removeAttribute("id");
                }
            }
        };
        if (!has("dom-matches-selector")) {
            var jsMatchesSelector = (function () {
                var caseFix = testDiv.tagName == "div" ? "toLowerCase" : "toUpperCase";
                var selectorTypes = {"":function (tagName) {
                    tagName = tagName[caseFix]();
                    return function (node) {
                        return node.tagName == tagName;
                    };
                }, ".":function (className) {
                    var classNameSpaced = " " + className + " ";
                    return function (node) {
                        return node.className.indexOf(className) > -1 && (" " + node.className + " ").indexOf(classNameSpaced) > -1;
                    };
                }, "#":function (id) {
                    return function (node) {
                        return node.id == id;
                    };
                }};
                var attrComparators = {"^=":function (attrValue, value) {
                    return attrValue.indexOf(value) == 0;
                }, "*=":function (attrValue, value) {
                    return attrValue.indexOf(value) > -1;
                }, "$=":function (attrValue, value) {
                    return attrValue.substring(attrValue.length - value.length, attrValue.length) == value;
                }, "~=":function (attrValue, value) {
                    return (" " + attrValue + " ").indexOf(" " + value + " ") > -1;
                }, "|=":function (attrValue, value) {
                    return (attrValue + "-").indexOf(value + "-") == 0;
                }, "=":function (attrValue, value) {
                    return attrValue == value;
                }, "":function (attrValue, value) {
                    return true;
                }};
                function attr(name, value, type) {
                    var firstChar = value.charAt(0);
                    if (firstChar == "\"" || firstChar == "'") {
                        value = value.slice(1, -1);
                    }
                    value = value.replace(/\\/g, "");
                    var comparator = attrComparators[type || ""];
                    return function (node) {
                        var attrValue = node.getAttribute(name);
                        return attrValue && comparator(attrValue, value);
                    };
                }
                function ancestor(matcher) {
                    return function (node, root) {
                        while ((node = node.parentNode) != root) {
                            if (matcher(node, root)) {
                                return true;
                            }
                        }
                    };
                }
                function parent(matcher) {
                    return function (node, root) {
                        node = node.parentNode;
                        return matcher ? node != root && matcher(node, root) : node == root;
                    };
                }
                var cache = {};
                function and(matcher, next) {
                    return matcher ? function (node, root) {
                        return next(node) && matcher(node, root);
                    } : next;
                }
                return function (node, selector, root) {
                    var matcher = cache[selector];
                    if (!matcher) {
                        if (selector.replace(/(?:\s*([> ])\s*)|(#|\.)?((?:\\.|[\w-])+)|\[\s*([\w-]+)\s*(.?=)?\s*("(?:\\.|[^"])+"|'(?:\\.|[^'])+'|(?:\\.|[^\]])*)\s*\]/g, function (t, combinator, type, value, attrName, attrType, attrValue) {
                            if (value) {
                                matcher = and(matcher, selectorTypes[type || ""](value.replace(/\\/g, "")));
                            } else {
                                if (combinator) {
                                    matcher = (combinator == " " ? ancestor : parent)(matcher);
                                } else {
                                    if (attrName) {
                                        matcher = and(matcher, attr(attrName, attrValue, attrType));
                                    }
                                }
                            }
                            return "";
                        })) {
                            throw new Error("Syntax error in query");
                        }
                        if (!matcher) {
                            return true;
                        }
                        cache[selector] = matcher;
                    }
                    return matcher(node, root);
                };
            })();
        }
        if (!has("dom-qsa")) {
            var combine = function (selector, root) {
                var selectors = selector.match(unionSplit);
                var indexed = [];
                for (var i = 0; i < selectors.length; i++) {
                    selector = new String(selectors[i].replace(/\s*$/, ""));
                    selector.indexOf = escape;
                    var results = liteEngine(selector, root);
                    for (var j = 0, l = results.length; j < l; j++) {
                        var node = results[j];
                        indexed[node.sourceIndex] = node;
                    }
                }
                var totalResults = [];
                for (i in indexed) {
                    totalResults.push(indexed[i]);
                }
                return totalResults;
            };
        }
        liteEngine.match = matchesSelector ? function (node, selector, root) {
            if (root && root.nodeType != 9) {
                return useRoot(root, selector, function (query) {
                    return matchesSelector.call(node, query);
                });
            }
            return matchesSelector.call(node, selector);
        } : jsMatchesSelector;
        return liteEngine;
    });
}, "dijit/_WidgetBase":function () {
    define("dijit/_WidgetBase", ["require", "dojo/_base/array", "dojo/aspect", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/has", "dojo/_base/kernel", "dojo/_base/lang", "dojo/on", "dojo/ready", "dojo/Stateful", "dojo/topic", "dojo/_base/window", "./Destroyable", "./registry"], function (require, array, aspect, config, connect, declare, dom, domAttr, domClass, domConstruct, domGeometry, domStyle, has, kernel, lang, on, ready, Stateful, topic, win, Destroyable, registry) {
        has.add("dijit-legacy-requires", !kernel.isAsync);
        if (has("dijit-legacy-requires")) {
            ready(0, function () {
                var requires = ["dijit/_base/manager"];
                require(requires);
            });
        }
        var tagAttrs = {};
        function getAttrs(obj) {
            var ret = {};
            for (var attr in obj) {
                ret[attr.toLowerCase()] = true;
            }
            return ret;
        }
        function nonEmptyAttrToDom(attr) {
            return function (val) {
                domAttr[val ? "set" : "remove"](this.domNode, attr, val);
                this._set(attr, val);
            };
        }
        return declare("dijit._WidgetBase", [Stateful, Destroyable], {id:"", _setIdAttr:"domNode", lang:"", _setLangAttr:nonEmptyAttrToDom("lang"), dir:"", _setDirAttr:nonEmptyAttrToDom("dir"), textDir:"", "class":"", _setClassAttr:{node:"domNode", type:"class"}, style:"", title:"", tooltip:"", baseClass:"", srcNodeRef:null, domNode:null, containerNode:null, ownerDocument:null, _setOwnerDocumentAttr:function (val) {
            this._set("ownerDocument", val);
        }, attributeMap:{}, _blankGif:config.blankGif || require.toUrl("dojo/resources/blank.gif"), postscript:function (params, srcNodeRef) {
            this.create(params, srcNodeRef);
        }, create:function (params, srcNodeRef) {
            this.srcNodeRef = dom.byId(srcNodeRef);
            this._connects = [];
            this._supportingWidgets = [];
            if (this.srcNodeRef && (typeof this.srcNodeRef.id == "string")) {
                this.id = this.srcNodeRef.id;
            }
            if (params) {
                this.params = params;
                lang.mixin(this, params);
            }
            this.postMixInProperties();
            if (!this.id) {
                this.id = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
                if (this.params) {
                    delete this.params.id;
                }
            }
            this.ownerDocument = this.ownerDocument || (this.srcNodeRef ? this.srcNodeRef.ownerDocument : win.doc);
            this.ownerDocumentBody = win.body(this.ownerDocument);
            registry.add(this);
            this.buildRendering();
            var deleteSrcNodeRef;
            if (this.domNode) {
                this._applyAttributes();
                var source = this.srcNodeRef;
                if (source && source.parentNode && this.domNode !== source) {
                    source.parentNode.replaceChild(this.domNode, source);
                    deleteSrcNodeRef = true;
                }
                this.domNode.setAttribute("widgetId", this.id);
            }
            this.postCreate();
            if (deleteSrcNodeRef) {
                delete this.srcNodeRef;
            }
            this._created = true;
        }, _applyAttributes:function () {
            var ctor = this.constructor, list = ctor._setterAttrs;
            if (!list) {
                list = (ctor._setterAttrs = []);
                for (var attr in this.attributeMap) {
                    list.push(attr);
                }
                var proto = ctor.prototype;
                for (var fxName in proto) {
                    if (fxName in this.attributeMap) {
                        continue;
                    }
                    var setterName = "_set" + fxName.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
                        return c.charAt(c.length - 1).toUpperCase();
                    }) + "Attr";
                    if (setterName in proto) {
                        list.push(fxName);
                    }
                }
            }
            array.forEach(list, function (attr) {
                if (this.params && attr in this.params) {
                } else {
                    if (this[attr]) {
                        this.set(attr, this[attr]);
                    }
                }
            }, this);
            for (var param in this.params) {
                this.set(param, this.params[param]);
            }
        }, postMixInProperties:function () {
        }, buildRendering:function () {
            if (!this.domNode) {
                this.domNode = this.srcNodeRef || this.ownerDocument.createElement("div");
            }
            if (this.baseClass) {
                var classes = this.baseClass.split(" ");
                if (!this.isLeftToRight()) {
                    classes = classes.concat(array.map(classes, function (name) {
                        return name + "Rtl";
                    }));
                }
                domClass.add(this.domNode, classes);
            }
        }, postCreate:function () {
        }, startup:function () {
            if (this._started) {
                return;
            }
            this._started = true;
            array.forEach(this.getChildren(), function (obj) {
                if (!obj._started && !obj._destroyed && lang.isFunction(obj.startup)) {
                    obj.startup();
                    obj._started = true;
                }
            });
        }, destroyRecursive:function (preserveDom) {
            this._beingDestroyed = true;
            this.destroyDescendants(preserveDom);
            this.destroy(preserveDom);
        }, destroy:function (preserveDom) {
            this._beingDestroyed = true;
            this.uninitialize();
            function destroy(w) {
                if (w.destroyRecursive) {
                    w.destroyRecursive(preserveDom);
                } else {
                    if (w.destroy) {
                        w.destroy(preserveDom);
                    }
                }
            }
            array.forEach(this._connects, lang.hitch(this, "disconnect"));
            array.forEach(this._supportingWidgets, destroy);
            array.forEach(registry.findWidgets(this.domNode, this.containerNode), destroy);
            this.destroyRendering(preserveDom);
            registry.remove(this.id);
            this._destroyed = true;
        }, destroyRendering:function (preserveDom) {
            if (this.bgIframe) {
                this.bgIframe.destroy(preserveDom);
                delete this.bgIframe;
            }
            if (this.domNode) {
                if (preserveDom) {
                    domAttr.remove(this.domNode, "widgetId");
                } else {
                    domConstruct.destroy(this.domNode);
                }
                delete this.domNode;
            }
            if (this.srcNodeRef) {
                if (!preserveDom) {
                    domConstruct.destroy(this.srcNodeRef);
                }
                delete this.srcNodeRef;
            }
        }, destroyDescendants:function (preserveDom) {
            array.forEach(this.getChildren(), function (widget) {
                if (widget.destroyRecursive) {
                    widget.destroyRecursive(preserveDom);
                }
            });
        }, uninitialize:function () {
            return false;
        }, _setStyleAttr:function (value) {
            var mapNode = this.domNode;
            if (lang.isObject(value)) {
                domStyle.set(mapNode, value);
            } else {
                if (mapNode.style.cssText) {
                    mapNode.style.cssText += "; " + value;
                } else {
                    mapNode.style.cssText = value;
                }
            }
            this._set("style", value);
        }, _attrToDom:function (attr, value, commands) {
            commands = arguments.length >= 3 ? commands : this.attributeMap[attr];
            array.forEach(lang.isArray(commands) ? commands : [commands], function (command) {
                var mapNode = this[command.node || command || "domNode"];
                var type = command.type || "attribute";
                switch (type) {
                  case "attribute":
                    if (lang.isFunction(value)) {
                        value = lang.hitch(this, value);
                    }
                    var attrName = command.attribute ? command.attribute : (/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);
                    if (mapNode.tagName) {
                        domAttr.set(mapNode, attrName, value);
                    } else {
                        mapNode.set(attrName, value);
                    }
                    break;
                  case "innerText":
                    mapNode.innerHTML = "";
                    mapNode.appendChild(this.ownerDocument.createTextNode(value));
                    break;
                  case "innerHTML":
                    mapNode.innerHTML = value;
                    break;
                  case "class":
                    domClass.replace(mapNode, value, this[attr]);
                    break;
                }
            }, this);
        }, get:function (name) {
            var names = this._getAttrNames(name);
            return this[names.g] ? this[names.g]() : this[name];
        }, set:function (name, value) {
            if (typeof name === "object") {
                for (var x in name) {
                    this.set(x, name[x]);
                }
                return this;
            }
            var names = this._getAttrNames(name), setter = this[names.s];
            if (lang.isFunction(setter)) {
                var result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                var defaultNode = this.focusNode && !lang.isFunction(this.focusNode) ? "focusNode" : "domNode", tag = this[defaultNode].tagName, attrsForTag = tagAttrs[tag] || (tagAttrs[tag] = getAttrs(this[defaultNode])), map = name in this.attributeMap ? this.attributeMap[name] : names.s in this ? this[names.s] : ((names.l in attrsForTag && typeof value != "function") || /^aria-|^data-|^role$/.test(name)) ? defaultNode : null;
                if (map != null) {
                    this._attrToDom(name, value, map);
                }
                this._set(name, value);
            }
            return result || this;
        }, _attrPairNames:{}, _getAttrNames:function (name) {
            var apn = this._attrPairNames;
            if (apn[name]) {
                return apn[name];
            }
            var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
                return c.charAt(c.length - 1).toUpperCase();
            });
            return (apn[name] = {n:name + "Node", s:"_set" + uc + "Attr", g:"_get" + uc + "Attr", l:uc.toLowerCase()});
        }, _set:function (name, value) {
            var oldValue = this[name];
            this[name] = value;
            if (this._created && value !== oldValue) {
                if (this._watchCallbacks) {
                    this._watchCallbacks(name, oldValue, value);
                }
                this.emit("attrmodified-" + name, {detail:{prevValue:oldValue, newValue:value}});
            }
        }, emit:function (type, eventObj, callbackArgs) {
            eventObj = eventObj || {};
            if (eventObj.bubbles === undefined) {
                eventObj.bubbles = true;
            }
            if (eventObj.cancelable === undefined) {
                eventObj.cancelable = true;
            }
            if (!eventObj.detail) {
                eventObj.detail = {};
            }
            eventObj.detail.widget = this;
            var ret, callback = this["on" + type];
            if (callback) {
                ret = callback.apply(this, callbackArgs ? callbackArgs : eventObj);
            }
            if (this._started && !this._beingDestroyed) {
                on.emit(this.domNode, type.toLowerCase(), eventObj);
            }
            return ret;
        }, on:function (type, func) {
            var widgetMethod = this._onMap(type);
            if (widgetMethod) {
                return aspect.after(this, widgetMethod, func, true);
            }
            return this.own(on(this.domNode, type, func))[0];
        }, _onMap:function (type) {
            var ctor = this.constructor, map = ctor._onMap;
            if (!map) {
                map = (ctor._onMap = {});
                for (var attr in ctor.prototype) {
                    if (/^on/.test(attr)) {
                        map[attr.replace(/^on/, "").toLowerCase()] = attr;
                    }
                }
            }
            return map[typeof type == "string" && type.toLowerCase()];
        }, toString:function () {
            return "[Widget " + this.declaredClass + ", " + (this.id || "NO ID") + "]";
        }, getChildren:function () {
            return this.containerNode ? registry.findWidgets(this.containerNode) : [];
        }, getParent:function () {
            return registry.getEnclosingWidget(this.domNode.parentNode);
        }, connect:function (obj, event, method) {
            return this.own(connect.connect(obj, event, this, method))[0];
        }, disconnect:function (handle) {
            handle.remove();
        }, subscribe:function (t, method) {
            return this.own(topic.subscribe(t, lang.hitch(this, method)))[0];
        }, unsubscribe:function (handle) {
            handle.remove();
        }, isLeftToRight:function () {
            return this.dir ? (this.dir == "ltr") : domGeometry.isBodyLtr(this.ownerDocument);
        }, isFocusable:function () {
            return this.focus && (domStyle.get(this.domNode, "display") != "none");
        }, placeAt:function (reference, position) {
            var refWidget = !reference.tagName && registry.byId(reference);
            if (refWidget && refWidget.addChild && (!position || typeof position === "number")) {
                refWidget.addChild(this, position);
            } else {
                var ref = refWidget ? (refWidget.containerNode && !/after|before|replace/.test(position || "") ? refWidget.containerNode : refWidget.domNode) : dom.byId(reference, this.ownerDocument);
                domConstruct.place(this.domNode, ref, position);
                if (!this._started && (this.getParent() || {})._started) {
                    this.startup();
                }
            }
            return this;
        }, getTextDir:function (text, originalDir) {
            return originalDir;
        }, applyTextDir:function () {
        }, defer:function (fcn, delay) {
            var timer = setTimeout(lang.hitch(this, function () {
                timer = null;
                if (!this._destroyed) {
                    lang.hitch(this, fcn)();
                }
            }), delay || 0);
            return {remove:function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                return null;
            }};
        }});
    });
}, "dojo/Stateful":function () {
    define("dojo/Stateful", ["./_base/declare", "./_base/lang", "./_base/array", "dojo/when"], function (declare, lang, array, when) {
        return declare("dojo.Stateful", null, {_attrPairNames:{}, _getAttrNames:function (name) {
            var apn = this._attrPairNames;
            if (apn[name]) {
                return apn[name];
            }
            return (apn[name] = {s:"_" + name + "Setter", g:"_" + name + "Getter"});
        }, postscript:function (params) {
            if (params) {
                this.set(params);
            }
        }, _get:function (name, names) {
            return typeof this[names.g] === "function" ? this[names.g]() : this[name];
        }, get:function (name) {
            return this._get(name, this._getAttrNames(name));
        }, set:function (name, value) {
            if (typeof name === "object") {
                for (var x in name) {
                    if (name.hasOwnProperty(x) && x != "_watchCallbacks") {
                        this.set(x, name[x]);
                    }
                }
                return this;
            }
            var names = this._getAttrNames(name), oldValue = this._get(name, names), setter = this[names.s], result;
            if (typeof setter === "function") {
                result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                this[name] = value;
            }
            if (this._watchCallbacks) {
                var self = this;
                when(result, function () {
                    self._watchCallbacks(name, oldValue, value);
                });
            }
            return this;
        }, _changeAttrValue:function (name, value) {
            var oldValue = this.get(name);
            this[name] = value;
            if (this._watchCallbacks) {
                this._watchCallbacks(name, oldValue, value);
            }
            return this;
        }, watch:function (name, callback) {
            var callbacks = this._watchCallbacks;
            if (!callbacks) {
                var self = this;
                callbacks = this._watchCallbacks = function (name, oldValue, value, ignoreCatchall) {
                    var notify = function (propertyCallbacks) {
                        if (propertyCallbacks) {
                            propertyCallbacks = propertyCallbacks.slice();
                            for (var i = 0, l = propertyCallbacks.length; i < l; i++) {
                                propertyCallbacks[i].call(self, name, oldValue, value);
                            }
                        }
                    };
                    notify(callbacks["_" + name]);
                    if (!ignoreCatchall) {
                        notify(callbacks["*"]);
                    }
                };
            }
            if (!callback && typeof name === "function") {
                callback = name;
                name = "*";
            } else {
                name = "_" + name;
            }
            var propertyCallbacks = callbacks[name];
            if (typeof propertyCallbacks !== "object") {
                propertyCallbacks = callbacks[name] = [];
            }
            propertyCallbacks.push(callback);
            var handle = {};
            handle.unwatch = handle.remove = function () {
                var index = array.indexOf(propertyCallbacks, callback);
                if (index > -1) {
                    propertyCallbacks.splice(index, 1);
                }
            };
            return handle;
        }});
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
}, "dijit/Destroyable":function () {
    define("dijit/Destroyable", ["dojo/_base/array", "dojo/aspect", "dojo/_base/declare"], function (array, aspect, declare) {
        return declare("dijit.Destroyable", null, {destroy:function (preserveDom) {
            this._destroyed = true;
        }, own:function () {
            array.forEach(arguments, function (handle) {
                var destroyMethodName = "destroyRecursive" in handle ? "destroyRecursive" : "destroy" in handle ? "destroy" : "remove";
                handle._odh = aspect.before(this, "destroy", function (preserveDom) {
                    handle._odh.remove();
                    handle[destroyMethodName](preserveDom);
                });
                aspect.after(handle, destroyMethodName, function () {
                    handle._odh.remove();
                });
            }, this);
            return arguments;
        }});
    });
}, "dijit/_OnDijitClickMixin":function () {
    define("dijit/_OnDijitClickMixin", ["dojo/on", "dojo/_base/array", "dojo/keys", "dojo/_base/declare", "dojo/has", "dojo/_base/unload", "dojo/_base/window", "./a11yclick"], function (on, array, keys, declare, has, unload, win, a11yclick) {
        var ret = declare("dijit._OnDijitClickMixin", null, {connect:function (obj, event, method) {
            return this.inherited(arguments, [obj, event == "ondijitclick" ? a11yclick : event, method]);
        }});
        ret.a11yclick = a11yclick;
        return ret;
    });
}, "dijit/a11yclick":function () {
    define("dijit/a11yclick", ["dojo/on", "dojo/_base/array", "dojo/keys", "dojo/_base/declare", "dojo/has", "dojo/_base/unload", "dojo/_base/window"], function (on, array, keys, declare, has, unload, win) {
        var lastKeyDownNode = null;
        if (has("dom-addeventlistener")) {
            win.doc.addEventListener("keydown", function (evt) {
                lastKeyDownNode = evt.target;
            }, true);
        } else {
            (function () {
                var keydownCallback = function (evt) {
                    lastKeyDownNode = evt.srcElement;
                };
                win.doc.attachEvent("onkeydown", keydownCallback);
                unload.addOnWindowUnload(function () {
                    win.doc.detachEvent("onkeydown", keydownCallback);
                });
            })();
        }
        function clickKey(e) {
            return (e.keyCode === keys.ENTER || e.keyCode === keys.SPACE) && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey;
        }
        return function (node, listener) {
            if (/input|button/i.test(node.nodeName)) {
                return on(node, "click", listener);
            } else {
                var handles = [on(node, "keydown", function (e) {
                    if (clickKey(e)) {
                        lastKeyDownNode = e.target;
                        e.preventDefault();
                    }
                }), on(node, "keyup", function (e) {
                    if (clickKey(e) && e.target == lastKeyDownNode) {
                        lastKeyDownNode = null;
                        on.emit(e.target, "click", {cancelable:true, bubbles:true});
                    }
                }), on(node, "click", function (e) {
                    listener.call(this, e);
                })];
                if (has("touch")) {
                    var clickTimer;
                    handles.push(on(node, "touchend", function (e) {
                        var target = e.target;
                        clickTimer = setTimeout(function () {
                            clickTimer = null;
                            on.emit(target, "click", {cancelable:true, bubbles:true});
                        }, 600);
                    }), on(node, "click", function (e) {
                        if (clickTimer) {
                            clearTimeout(clickTimer);
                        }
                    }));
                }
                return {remove:function () {
                    array.forEach(handles, function (h) {
                        h.remove();
                    });
                    if (clickTimer) {
                        clearTimeout(clickTimer);
                        clickTimer = null;
                    }
                }};
            }
        };
        return ret;
    });
}, "dijit/_FocusMixin":function () {
    define("dijit/_FocusMixin", ["./focus", "./_WidgetBase", "dojo/_base/declare", "dojo/_base/lang"], function (focus, _WidgetBase, declare, lang) {
        lang.extend(_WidgetBase, {focused:false, onFocus:function () {
        }, onBlur:function () {
        }, _onFocus:function () {
            this.onFocus();
        }, _onBlur:function () {
            this.onBlur();
        }});
        return declare("dijit._FocusMixin", null, {_focusManager:focus});
    });
}, "dijit/focus":function () {
    define("dijit/focus", ["dojo/aspect", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-construct", "dojo/Evented", "dojo/_base/lang", "dojo/on", "dojo/ready", "dojo/sniff", "dojo/Stateful", "dojo/_base/unload", "dojo/_base/window", "dojo/window", "./a11y", "./registry", "./main"], function (aspect, declare, dom, domAttr, domConstruct, Evented, lang, on, ready, has, Stateful, unload, win, winUtils, a11y, registry, dijit) {
        var FocusManager = declare([Stateful, Evented], {curNode:null, activeStack:[], constructor:function () {
            var check = lang.hitch(this, function (node) {
                if (dom.isDescendant(this.curNode, node)) {
                    this.set("curNode", null);
                }
                if (dom.isDescendant(this.prevNode, node)) {
                    this.set("prevNode", null);
                }
            });
            aspect.before(domConstruct, "empty", check);
            aspect.before(domConstruct, "destroy", check);
        }, registerIframe:function (iframe) {
            return this.registerWin(iframe.contentWindow, iframe);
        }, registerWin:function (targetWindow, effectiveNode) {
            var _this = this;
            var mousedownListener = function (evt) {
                _this._justMouseDowned = true;
                setTimeout(function () {
                    _this._justMouseDowned = false;
                }, 0);
                if (has("ie") && evt && evt.srcElement && evt.srcElement.parentNode == null) {
                    return;
                }
                _this._onTouchNode(effectiveNode || evt.target || evt.srcElement, "mouse");
            };
            var doc = has("ie") ? targetWindow.document.documentElement : targetWindow.document;
            if (doc) {
                if (has("ie")) {
                    targetWindow.document.body.attachEvent("onmousedown", mousedownListener);
                    var focusinListener = function (evt) {
                        var tag = evt.srcElement.tagName.toLowerCase();
                        if (tag == "#document" || tag == "body") {
                            return;
                        }
                        if (a11y.isTabNavigable(evt.srcElement)) {
                            _this._onFocusNode(effectiveNode || evt.srcElement);
                        } else {
                            _this._onTouchNode(effectiveNode || evt.srcElement);
                        }
                    };
                    doc.attachEvent("onfocusin", focusinListener);
                    var focusoutListener = function (evt) {
                        _this._onBlurNode(effectiveNode || evt.srcElement);
                    };
                    doc.attachEvent("onfocusout", focusoutListener);
                    return {remove:function () {
                        targetWindow.document.detachEvent("onmousedown", mousedownListener);
                        doc.detachEvent("onfocusin", focusinListener);
                        doc.detachEvent("onfocusout", focusoutListener);
                        doc = null;
                    }};
                } else {
                    doc.body.addEventListener("mousedown", mousedownListener, true);
                    doc.body.addEventListener("touchstart", mousedownListener, true);
                    var focusListener = function (evt) {
                        _this._onFocusNode(effectiveNode || evt.target);
                    };
                    doc.addEventListener("focus", focusListener, true);
                    var blurListener = function (evt) {
                        _this._onBlurNode(effectiveNode || evt.target);
                    };
                    doc.addEventListener("blur", blurListener, true);
                    return {remove:function () {
                        doc.body.removeEventListener("mousedown", mousedownListener, true);
                        doc.body.removeEventListener("touchstart", mousedownListener, true);
                        doc.removeEventListener("focus", focusListener, true);
                        doc.removeEventListener("blur", blurListener, true);
                        doc = null;
                    }};
                }
            }
        }, _onBlurNode:function (node) {
            if (this._clearFocusTimer) {
                clearTimeout(this._clearFocusTimer);
            }
            this._clearFocusTimer = setTimeout(lang.hitch(this, function () {
                this.set("prevNode", this.curNode);
                this.set("curNode", null);
            }), 0);
            if (this._justMouseDowned) {
                return;
            }
            if (this._clearActiveWidgetsTimer) {
                clearTimeout(this._clearActiveWidgetsTimer);
            }
            this._clearActiveWidgetsTimer = setTimeout(lang.hitch(this, function () {
                delete this._clearActiveWidgetsTimer;
                this._setStack([]);
            }), 0);
        }, _onTouchNode:function (node, by) {
            if (this._clearActiveWidgetsTimer) {
                clearTimeout(this._clearActiveWidgetsTimer);
                delete this._clearActiveWidgetsTimer;
            }
            var newStack = [];
            try {
                while (node) {
                    var popupParent = domAttr.get(node, "dijitPopupParent");
                    if (popupParent) {
                        node = registry.byId(popupParent).domNode;
                    } else {
                        if (node.tagName && node.tagName.toLowerCase() == "body") {
                            if (node === win.body()) {
                                break;
                            }
                            node = winUtils.get(node.ownerDocument).frameElement;
                        } else {
                            var id = node.getAttribute && node.getAttribute("widgetId"), widget = id && registry.byId(id);
                            if (widget && !(by == "mouse" && widget.get("disabled"))) {
                                newStack.unshift(id);
                            }
                            node = node.parentNode;
                        }
                    }
                }
            }
            catch (e) {
            }
            this._setStack(newStack, by);
        }, _onFocusNode:function (node) {
            if (!node) {
                return;
            }
            if (node.nodeType == 9) {
                return;
            }
            if (this._clearFocusTimer) {
                clearTimeout(this._clearFocusTimer);
                delete this._clearFocusTimer;
            }
            this._onTouchNode(node);
            if (node == this.curNode) {
                return;
            }
            this.set("prevNode", this.curNode);
            this.set("curNode", node);
        }, _setStack:function (newStack, by) {
            var oldStack = this.activeStack;
            this.set("activeStack", newStack);
            for (var nCommon = 0; nCommon < Math.min(oldStack.length, newStack.length); nCommon++) {
                if (oldStack[nCommon] != newStack[nCommon]) {
                    break;
                }
            }
            var widget;
            for (var i = oldStack.length - 1; i >= nCommon; i--) {
                widget = registry.byId(oldStack[i]);
                if (widget) {
                    widget._hasBeenBlurred = true;
                    widget.set("focused", false);
                    if (widget._focusManager == this) {
                        widget._onBlur(by);
                    }
                    this.emit("widget-blur", widget, by);
                }
            }
            for (i = nCommon; i < newStack.length; i++) {
                widget = registry.byId(newStack[i]);
                if (widget) {
                    widget.set("focused", true);
                    if (widget._focusManager == this) {
                        widget._onFocus(by);
                    }
                    this.emit("widget-focus", widget, by);
                }
            }
        }, focus:function (node) {
            if (node) {
                try {
                    node.focus();
                }
                catch (e) {
                }
            }
        }});
        var singleton = new FocusManager();
        ready(function () {
            var handle = singleton.registerWin(winUtils.get(win.doc));
            if (has("ie")) {
                unload.addOnWindowUnload(function () {
                    if (handle) {
                        handle.remove();
                        handle = null;
                    }
                });
            }
        });
        dijit.focus = function (node) {
            singleton.focus(node);
        };
        for (var attr in singleton) {
            if (!/^_/.test(attr)) {
                dijit.focus[attr] = typeof singleton[attr] == "function" ? lang.hitch(singleton, attr) : singleton[attr];
            }
        }
        singleton.watch(function (attr, oldVal, newVal) {
            dijit.focus[attr] = newVal;
        });
        return singleton;
    });
}, "dijit/a11y":function () {
    define("dijit/a11y", ["dojo/_base/array", "dojo/_base/config", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-style", "dojo/sniff", "./main"], function (array, config, declare, dom, domAttr, domStyle, has, dijit) {
        var shown = (dijit._isElementShown = function (elem) {
            var s = domStyle.get(elem);
            return (s.visibility != "hidden") && (s.visibility != "collapsed") && (s.display != "none") && (domAttr.get(elem, "type") != "hidden");
        });
        dijit.hasDefaultTabStop = function (elem) {
            switch (elem.nodeName.toLowerCase()) {
              case "a":
                return domAttr.has(elem, "href");
              case "area":
              case "button":
              case "input":
              case "object":
              case "select":
              case "textarea":
                return true;
              case "iframe":
                var body;
                try {
                    var contentDocument = elem.contentDocument;
                    if ("designMode" in contentDocument && contentDocument.designMode == "on") {
                        return true;
                    }
                    body = contentDocument.body;
                }
                catch (e1) {
                    try {
                        body = elem.contentWindow.document.body;
                    }
                    catch (e2) {
                        return false;
                    }
                }
                return body && (body.contentEditable == "true" || (body.firstChild && body.firstChild.contentEditable == "true"));
              default:
                return elem.contentEditable == "true";
            }
        };
        var isTabNavigable = (dijit.isTabNavigable = function (elem) {
            if (domAttr.get(elem, "disabled")) {
                return false;
            } else {
                if (domAttr.has(elem, "tabIndex")) {
                    return domAttr.get(elem, "tabIndex") >= 0;
                } else {
                    return dijit.hasDefaultTabStop(elem);
                }
            }
        });
        dijit._getTabNavigable = function (root) {
            var first, last, lowest, lowestTabindex, highest, highestTabindex, radioSelected = {};
            function radioName(node) {
                return node && node.tagName.toLowerCase() == "input" && node.type && node.type.toLowerCase() == "radio" && node.name && node.name.toLowerCase();
            }
            var walkTree = function (parent) {
                for (var child = parent.firstChild; child; child = child.nextSibling) {
                    if (child.nodeType != 1 || (has("ie") && child.scopeName !== "HTML") || !shown(child)) {
                        continue;
                    }
                    if (isTabNavigable(child)) {
                        var tabindex = +domAttr.get(child, "tabIndex");
                        if (!domAttr.has(child, "tabIndex") || tabindex == 0) {
                            if (!first) {
                                first = child;
                            }
                            last = child;
                        } else {
                            if (tabindex > 0) {
                                if (!lowest || tabindex < lowestTabindex) {
                                    lowestTabindex = tabindex;
                                    lowest = child;
                                }
                                if (!highest || tabindex >= highestTabindex) {
                                    highestTabindex = tabindex;
                                    highest = child;
                                }
                            }
                        }
                        var rn = radioName(child);
                        if (domAttr.get(child, "checked") && rn) {
                            radioSelected[rn] = child;
                        }
                    }
                    if (child.nodeName.toUpperCase() != "SELECT") {
                        walkTree(child);
                    }
                }
            };
            if (shown(root)) {
                walkTree(root);
            }
            function rs(node) {
                return radioSelected[radioName(node)] || node;
            }
            return {first:rs(first), last:rs(last), lowest:rs(lowest), highest:rs(highest)};
        };
        dijit.getFirstInTabbingOrder = function (root, doc) {
            var elems = dijit._getTabNavigable(dom.byId(root, doc));
            return elems.lowest ? elems.lowest : elems.first;
        };
        dijit.getLastInTabbingOrder = function (root, doc) {
            var elems = dijit._getTabNavigable(dom.byId(root, doc));
            return elems.last ? elems.last : elems.highest;
        };
        return {hasDefaultTabStop:dijit.hasDefaultTabStop, isTabNavigable:dijit.isTabNavigable, _getTabNavigable:dijit._getTabNavigable, getFirstInTabbingOrder:dijit.getFirstInTabbingOrder, getLastInTabbingOrder:dijit.getLastInTabbingOrder};
    });
}, "dojo/uacss":function () {
    define("dojo/uacss", ["./dom-geometry", "./_base/lang", "./ready", "./sniff", "./_base/window"], function (geometry, lang, ready, has, baseWindow) {
        var html = baseWindow.doc.documentElement, ie = has("ie"), opera = has("opera"), maj = Math.floor, ff = has("ff"), boxModel = geometry.boxModel.replace(/-/, ""), classes = {"dj_ie":ie, "dj_ie6":maj(ie) == 6, "dj_ie7":maj(ie) == 7, "dj_ie8":maj(ie) == 8, "dj_ie9":maj(ie) == 9, "dj_quirks":has("quirks"), "dj_iequirks":ie && has("quirks"), "dj_opera":opera, "dj_khtml":has("khtml"), "dj_webkit":has("webkit"), "dj_safari":has("safari"), "dj_chrome":has("chrome"), "dj_gecko":has("mozilla"), "dj_ff3":maj(ff) == 3};
        classes["dj_" + boxModel] = true;
        var classStr = "";
        for (var clz in classes) {
            if (classes[clz]) {
                classStr += clz + " ";
            }
        }
        html.className = lang.trim(html.className + " " + classStr);
        ready(90, function () {
            if (!geometry.isBodyLtr()) {
                var rtlClassStr = "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl ");
                html.className = lang.trim(html.className + " " + rtlClassStr + "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl "));
            }
        });
        return has;
    });
}, "dijit/hccss":function () {
    define("dijit/hccss", ["dojo/dom-class", "dojo/hccss", "dojo/ready", "dojo/_base/window"], function (domClass, has, ready, win) {
        ready(90, function () {
            if (has("highcontrast")) {
                domClass.add(win.body(), "dijit_a11y");
            }
        });
        return has;
    });
}, "dojo/hccss":function () {
    define("dojo/hccss", ["require", "./_base/config", "./dom-class", "./dom-construct", "./dom-style", "./has", "./ready", "./_base/window"], function (require, config, domClass, domConstruct, domStyle, has, ready, win) {
        has.add("highcontrast", function () {
            var div = win.doc.createElement("div");
            div.style.cssText = "border: 1px solid; border-color:red green; position: absolute; height: 5px; top: -999px;" + "background-image: url(" + (config.blankGif || require.toUrl("./resources/blank.gif")) + ");";
            win.body().appendChild(div);
            var cs = domStyle.getComputedStyle(div), bkImg = cs.backgroundImage, hc = (cs.borderTopColor == cs.borderRightColor) || (bkImg && (bkImg == "none" || bkImg == "url(invalid-url:)"));
            domConstruct.destroy(div);
            return hc;
        });
        ready(90, function () {
            if (has("highcontrast")) {
                domClass.add(win.body(), "dj_a11y");
            }
        });
        return has;
    });
}, "dijit/_TemplatedMixin":function () {
    define("dijit/_TemplatedMixin", ["dojo/_base/lang", "dojo/touch", "./_WidgetBase", "dojo/string", "dojo/cache", "dojo/_base/array", "dojo/_base/declare", "dojo/dom-construct", "dojo/sniff", "dojo/_base/unload"], function (lang, touch, _WidgetBase, string, cache, array, declare, domConstruct, has, unload) {
        var _TemplatedMixin = declare("dijit._TemplatedMixin", null, {templateString:null, templatePath:null, _skipNodeCache:false, _earlyTemplatedStartup:false, constructor:function () {
            this._attachPoints = [];
            this._attachEvents = [];
        }, _stringRepl:function (tmpl) {
            var className = this.declaredClass, _this = this;
            return string.substitute(tmpl, this, function (value, key) {
                if (key.charAt(0) == "!") {
                    value = lang.getObject(key.substr(1), false, _this);
                }
                if (typeof value == "undefined") {
                    throw new Error(className + " template:" + key);
                }
                if (value == null) {
                    return "";
                }
                return key.charAt(0) == "!" ? value : value.toString().replace(/"/g, "&quot;");
            }, this);
        }, buildRendering:function () {
            if (!this.templateString) {
                this.templateString = cache(this.templatePath, {sanitize:true});
            }
            var cached = _TemplatedMixin.getCachedTemplate(this.templateString, this._skipNodeCache, this.ownerDocument);
            var node;
            if (lang.isString(cached)) {
                node = domConstruct.toDom(this._stringRepl(cached), this.ownerDocument);
                if (node.nodeType != 1) {
                    throw new Error("Invalid template: " + cached);
                }
            } else {
                node = cached.cloneNode(true);
            }
            this.domNode = node;
            this.inherited(arguments);
            this._attachTemplateNodes(node, function (n, p) {
                return n.getAttribute(p);
            });
            this._beforeFillContent();
            this._fillContent(this.srcNodeRef);
        }, _beforeFillContent:function () {
        }, _fillContent:function (source) {
            var dest = this.containerNode;
            if (source && dest) {
                while (source.hasChildNodes()) {
                    dest.appendChild(source.firstChild);
                }
            }
        }, _attachTemplateNodes:function (rootNode, getAttrFunc) {
            var nodes = lang.isArray(rootNode) ? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
            var x = lang.isArray(rootNode) ? 0 : -1;
            for (; x < 0 || nodes[x]; x++) {
                var baseNode = (x == -1) ? rootNode : nodes[x];
                if (this.widgetsInTemplate && (getAttrFunc(baseNode, "dojoType") || getAttrFunc(baseNode, "data-dojo-type"))) {
                    continue;
                }
                var attachPoint = getAttrFunc(baseNode, "dojoAttachPoint") || getAttrFunc(baseNode, "data-dojo-attach-point");
                if (attachPoint) {
                    var point, points = attachPoint.split(/\s*,\s*/);
                    while ((point = points.shift())) {
                        if (lang.isArray(this[point])) {
                            this[point].push(baseNode);
                        } else {
                            this[point] = baseNode;
                        }
                        this._attachPoints.push(point);
                    }
                }
                var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent") || getAttrFunc(baseNode, "data-dojo-attach-event");
                if (attachEvent) {
                    var event, events = attachEvent.split(/\s*,\s*/);
                    var trim = lang.trim;
                    while ((event = events.shift())) {
                        if (event) {
                            var thisFunc = null;
                            if (event.indexOf(":") != -1) {
                                var funcNameArr = event.split(":");
                                event = trim(funcNameArr[0]);
                                thisFunc = trim(funcNameArr[1]);
                            } else {
                                event = trim(event);
                            }
                            if (!thisFunc) {
                                thisFunc = event;
                            }
                            this._attachEvents.push(this.connect(baseNode, touch[event] || event, thisFunc));
                        }
                    }
                }
            }
        }, destroyRendering:function () {
            array.forEach(this._attachPoints, function (point) {
                delete this[point];
            }, this);
            this._attachPoints = [];
            array.forEach(this._attachEvents, this.disconnect, this);
            this._attachEvents = [];
            this.inherited(arguments);
        }});
        _TemplatedMixin._templateCache = {};
        _TemplatedMixin.getCachedTemplate = function (templateString, alwaysUseString, doc) {
            var tmplts = _TemplatedMixin._templateCache;
            var key = templateString;
            var cached = tmplts[key];
            if (cached) {
                try {
                    if (!cached.ownerDocument || cached.ownerDocument == (doc || document)) {
                        return cached;
                    }
                }
                catch (e) {
                }
                domConstruct.destroy(cached);
            }
            templateString = string.trim(templateString);
            if (alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g)) {
                return (tmplts[key] = templateString);
            } else {
                var node = domConstruct.toDom(templateString, doc);
                if (node.nodeType != 1) {
                    throw new Error("Invalid template: " + templateString);
                }
                return (tmplts[key] = node);
            }
        };
        if (has("ie")) {
            unload.addOnWindowUnload(function () {
                var cache = _TemplatedMixin._templateCache;
                for (var key in cache) {
                    var value = cache[key];
                    if (typeof value == "object") {
                        domConstruct.destroy(value);
                    }
                    delete cache[key];
                }
            });
        }
        lang.extend(_WidgetBase, {dojoAttachEvent:"", dojoAttachPoint:""});
        return _TemplatedMixin;
    });
}, "dojo/touch":function () {
    define("dojo/touch", ["./_base/kernel", "./_base/lang", "./aspect", "./dom", "./on", "./has", "./mouse", "./ready", "./_base/window"], function (dojo, lang, aspect, dom, on, has, mouse, ready, win) {
        var hasTouch = has("touch");
        var touchmove, hoveredNode;
        if (hasTouch) {
            ready(function () {
                hoveredNode = win.body();
                win.doc.addEventListener("touchstart", function (evt) {
                    var oldNode = hoveredNode;
                    hoveredNode = evt.target;
                    on.emit(oldNode, "dojotouchout", {target:oldNode, relatedTarget:hoveredNode, bubbles:true});
                    on.emit(hoveredNode, "dojotouchover", {target:hoveredNode, relatedTarget:oldNode, bubbles:true});
                }, true);
                on(win.doc, "touchmove", function (evt) {
                    var oldNode = hoveredNode;
                    hoveredNode = win.doc.elementFromPoint(evt.pageX - win.body().parentNode.scrollLeft, evt.pageY - win.body().parentNode.scrollTop);
                    if (oldNode !== hoveredNode) {
                        on.emit(oldNode, "dojotouchout", {target:oldNode, relatedTarget:hoveredNode, bubbles:true});
                        on.emit(hoveredNode, "dojotouchover", {target:hoveredNode, relatedTarget:oldNode, bubbles:true});
                    }
                });
            });
            touchmove = function (node, listener) {
                return on(win.doc, "touchmove", function (evt) {
                    if (node === win.doc || dom.isDescendant(hoveredNode, node)) {
                        listener.call(this, lang.mixin({}, evt, {target:hoveredNode}));
                    }
                });
            };
        }
        function _handle(type) {
            return function (node, listener) {
                return on(node, type, listener);
            };
        }
        var touch = {press:_handle(hasTouch ? "touchstart" : "mousedown"), move:hasTouch ? touchmove : _handle("mousemove"), release:_handle(hasTouch ? "touchend" : "mouseup"), cancel:hasTouch ? _handle("touchcancel") : mouse.leave, over:_handle(hasTouch ? "dojotouchover" : "mouseover"), out:_handle(hasTouch ? "dojotouchout" : "mouseout"), enter:mouse._eventHandler(hasTouch ? "dojotouchover" : "mouseover"), leave:mouse._eventHandler(hasTouch ? "dojotouchout" : "mouseout")};
        1 && (dojo.touch = touch);
        return touch;
    });
}, "dojo/string":function () {
    define("dojo/string", ["./_base/kernel", "./_base/lang"], function (kernel, lang) {
        var string = {};
        lang.setObject("dojo.string", string);
        string.rep = function (str, num) {
            if (num <= 0 || !str) {
                return "";
            }
            var buf = [];
            for (; ; ) {
                if (num & 1) {
                    buf.push(str);
                }
                if (!(num >>= 1)) {
                    break;
                }
                str += str;
            }
            return buf.join("");
        };
        string.pad = function (text, size, ch, end) {
            if (!ch) {
                ch = "0";
            }
            var out = String(text), pad = string.rep(ch, Math.ceil((size - out.length) / ch.length));
            return end ? out + pad : pad + out;
        };
        string.substitute = function (template, map, transform, thisObject) {
            thisObject = thisObject || kernel.global;
            transform = transform ? lang.hitch(thisObject, transform) : function (v) {
                return v;
            };
            return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key, format) {
                var value = lang.getObject(key, false, map);
                if (format) {
                    value = lang.getObject(format, false, thisObject).call(thisObject, value, key);
                }
                return transform(value, key).toString();
            });
        };
        string.trim = String.prototype.trim ? lang.trim : function (str) {
            str = str.replace(/^\s+/, "");
            for (var i = str.length - 1; i >= 0; i--) {
                if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return str;
        };
        return string;
    });
}, "dojo/cache":function () {
    define("dojo/cache", ["./_base/kernel", "./text"], function (dojo) {
        return dojo.cache;
    });
}, "dojo/text":function () {
    define("dojo/text", ["./_base/kernel", "require", "./has", "./has!host-browser?./_base/xhr"], function (dojo, require, has, xhr) {
        var getText;
        if (has("host-browser")) {
            getText = function (url, sync, load) {
                xhr("GET", {url:url, sync:!!sync, load:load, headers:dojo.config.textPluginHeaders || {}});
            };
        } else {
            if (require.getText) {
                getText = require.getText;
            } else {
                console.error("dojo/text plugin failed to load because loader does not support getText");
            }
        }
        var theCache = {}, strip = function (text) {
            if (text) {
                text = text.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, "");
                var matches = text.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
                if (matches) {
                    text = matches[1];
                }
            } else {
                text = "";
            }
            return text;
        }, notFound = {}, pending = {};
        dojo.cache = function (module, url, value) {
            var key;
            if (typeof module == "string") {
                if (/\//.test(module)) {
                    key = module;
                    value = url;
                } else {
                    key = require.toUrl(module.replace(/\./g, "/") + (url ? ("/" + url) : ""));
                }
            } else {
                key = module + "";
                value = url;
            }
            var val = (value != undefined && typeof value != "string") ? value.value : value, sanitize = value && value.sanitize;
            if (typeof val == "string") {
                theCache[key] = val;
                return sanitize ? strip(val) : val;
            } else {
                if (val === null) {
                    delete theCache[key];
                    return null;
                } else {
                    if (!(key in theCache)) {
                        getText(key, true, function (text) {
                            theCache[key] = text;
                        });
                    }
                    return sanitize ? strip(theCache[key]) : theCache[key];
                }
            }
        };
        return {dynamic:true, normalize:function (id, toAbsMid) {
            var parts = id.split("!"), url = parts[0];
            return (/^\./.test(url) ? toAbsMid(url) : url) + (parts[1] ? "!" + parts[1] : "");
        }, load:function (id, require, load) {
            var parts = id.split("!"), stripFlag = parts.length > 1, absMid = parts[0], url = require.toUrl(parts[0]), requireCacheUrl = "url:" + url, text = notFound, finish = function (text) {
                load(stripFlag ? strip(text) : text);
            };
            if (absMid in theCache) {
                text = theCache[absMid];
            } else {
                if (requireCacheUrl in require.cache) {
                    text = require.cache[requireCacheUrl];
                } else {
                    if (url in theCache) {
                        text = theCache[url];
                    }
                }
            }
            if (text === notFound) {
                if (pending[url]) {
                    pending[url].push(finish);
                } else {
                    var pendingList = pending[url] = [finish];
                    getText(url, !require.async, function (text) {
                        theCache[absMid] = theCache[url] = text;
                        for (var i = 0; i < pendingList.length; ) {
                            pendingList[i++](text);
                        }
                        delete pending[url];
                    });
                }
            } else {
                finish(text);
            }
        }};
    });
}, "dijit/BackgroundIframe":function () {
    define("dijit/BackgroundIframe", ["require", "./main", "dojo/_base/config", "dojo/dom-construct", "dojo/dom-style", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/_base/window"], function (require, dijit, config, domConstruct, domStyle, lang, on, has, win) {
        var _frames = new function () {
            var queue = [];
            this.pop = function () {
                var iframe;
                if (queue.length) {
                    iframe = queue.pop();
                    iframe.style.display = "";
                } else {
                    if (has("ie") < 9) {
                        var burl = config["dojoBlankHtmlUrl"] || require.toUrl("dojo/resources/blank.html") || "javascript:\"\"";
                        var html = "<iframe src='" + burl + "' role='presentation'" + " style='position: absolute; left: 0px; top: 0px;" + "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
                        iframe = win.doc.createElement(html);
                    } else {
                        iframe = domConstruct.create("iframe");
                        iframe.src = "javascript:\"\"";
                        iframe.className = "dijitBackgroundIframe";
                        iframe.setAttribute("role", "presentation");
                        domStyle.set(iframe, "opacity", 0.1);
                    }
                    iframe.tabIndex = -1;
                }
                return iframe;
            };
            this.push = function (iframe) {
                iframe.style.display = "none";
                queue.push(iframe);
            };
        }();
        dijit.BackgroundIframe = function (node) {
            if (!node.id) {
                throw new Error("no id");
            }
            if (has("ie") || has("mozilla")) {
                var iframe = (this.iframe = _frames.pop());
                node.appendChild(iframe);
                if (has("ie") < 7 || has("quirks")) {
                    this.resize(node);
                    this._conn = on(node, "resize", lang.hitch(this, function () {
                        this.resize(node);
                    }));
                } else {
                    domStyle.set(iframe, {width:"100%", height:"100%"});
                }
            }
        };
        lang.extend(dijit.BackgroundIframe, {resize:function (node) {
            if (this.iframe) {
                domStyle.set(this.iframe, {width:node.offsetWidth + "px", height:node.offsetHeight + "px"});
            }
        }, destroy:function () {
            if (this._conn) {
                this._conn.remove();
                this._conn = null;
            }
            if (this.iframe) {
                _frames.push(this.iframe);
                delete this.iframe;
            }
        }});
        return dijit.BackgroundIframe;
    });
}, "url:dijit/templates/Tooltip.html":"<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\"\n\t><div class=\"dijitTooltipContainer dijitTooltipContents\" data-dojo-attach-point=\"containerNode\" role='alert'></div\n\t><div class=\"dijitTooltipConnector\" data-dojo-attach-point=\"connectorNode\"></div\n></div>\n", "kitsonkelly/LastFMPager":function () {
    require({cache:{"url:kitsonkelly/resources/_LastFMPane.html":"undefined"}});
    define("kitsonkelly/LastFMPager", ["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/layout/_LayoutWidget", "dojo/text!./resources/_LastFMPane.html"], function (declare, _WidgetBase, _TemplatedMixin, _LayoutWidget, template) {
        var _LastFMPane = declare([_WidgetBase, _TemplatedMixin], {template:template});
        return declare([_LayoutWidget], {data:null});
    });
}, "dijit/layout/_LayoutWidget":function () {
    define("dijit/layout/_LayoutWidget", ["dojo/_base/lang", "../_Widget", "../_Container", "../_Contained", "../Viewport", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style"], function (lang, _Widget, _Container, _Contained, Viewport, declare, domClass, domGeometry, domStyle) {
        return declare("dijit.layout._LayoutWidget", [_Widget, _Container, _Contained], {baseClass:"dijitLayoutContainer", isLayoutContainer:true, buildRendering:function () {
            this.inherited(arguments);
            domClass.add(this.domNode, "dijitContainer");
        }, startup:function () {
            if (this._started) {
                return;
            }
            this.inherited(arguments);
            var parent = this.getParent && this.getParent();
            if (!(parent && parent.isLayoutContainer)) {
                this.resize();
                this.own(Viewport.on("resize", lang.hitch(this, "resize")));
            }
        }, resize:function (changeSize, resultSize) {
            var node = this.domNode;
            if (changeSize) {
                domGeometry.setMarginBox(node, changeSize);
            }
            var mb = resultSize || {};
            lang.mixin(mb, changeSize || {});
            if (!("h" in mb) || !("w" in mb)) {
                mb = lang.mixin(domGeometry.getMarginBox(node), mb);
            }
            var cs = domStyle.getComputedStyle(node);
            var me = domGeometry.getMarginExtents(node, cs);
            var be = domGeometry.getBorderExtents(node, cs);
            var bb = (this._borderBox = {w:mb.w - (me.w + be.w), h:mb.h - (me.h + be.h)});
            var pe = domGeometry.getPadExtents(node, cs);
            this._contentBox = {l:domStyle.toPixelValue(node, cs.paddingLeft), t:domStyle.toPixelValue(node, cs.paddingTop), w:bb.w - pe.w, h:bb.h - pe.h};
            this.layout();
        }, layout:function () {
        }, _setupChild:function (child) {
            var cls = this.baseClass + "-child " + (child.baseClass ? this.baseClass + "-" + child.baseClass : "");
            domClass.add(child.domNode, cls);
        }, addChild:function (child, insertIndex) {
            this.inherited(arguments);
            if (this._started) {
                this._setupChild(child);
            }
        }, removeChild:function (child) {
            var cls = this.baseClass + "-child" + (child.baseClass ? " " + this.baseClass + "-" + child.baseClass : "");
            domClass.remove(child.domNode, cls);
            this.inherited(arguments);
        }});
    });
}, "dijit/_Container":function () {
    define("dijit/_Container", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-construct"], function (array, declare, domConstruct) {
        return declare("dijit._Container", null, {buildRendering:function () {
            this.inherited(arguments);
            if (!this.containerNode) {
                this.containerNode = this.domNode;
            }
        }, addChild:function (widget, insertIndex) {
            var refNode = this.containerNode;
            if (insertIndex && typeof insertIndex == "number") {
                var children = this.getChildren();
                if (children && children.length >= insertIndex) {
                    refNode = children[insertIndex - 1].domNode;
                    insertIndex = "after";
                }
            }
            domConstruct.place(widget.domNode, refNode, insertIndex);
            if (this._started && !widget._started) {
                widget.startup();
            }
        }, removeChild:function (widget) {
            if (typeof widget == "number") {
                widget = this.getChildren()[widget];
            }
            if (widget) {
                var node = widget.domNode;
                if (node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
        }, hasChildren:function () {
            return this.getChildren().length > 0;
        }, _getSiblingOfChild:function (child, dir) {
            var children = this.getChildren(), idx = array.indexOf(this.getChildren(), child);
            return children[idx + dir];
        }, getIndexOfChild:function (child) {
            return array.indexOf(this.getChildren(), child);
        }});
    });
}, "dijit/_Contained":function () {
    define("dijit/_Contained", ["dojo/_base/declare", "./registry"], function (declare, registry) {
        return declare("dijit._Contained", null, {_getSibling:function (which) {
            var node = this.domNode;
            do {
                node = node[which + "Sibling"];
            } while (node && node.nodeType != 1);
            return node && registry.byNode(node);
        }, getPreviousSibling:function () {
            return this._getSibling("previous");
        }, getNextSibling:function () {
            return this._getSibling("next");
        }, getIndexInParent:function () {
            var p = this.getParent();
            if (!p || !p.getIndexOfChild) {
                return -1;
            }
            return p.getIndexOfChild(this);
        }});
    });
}, "dijit/Viewport":function () {
    define("dijit/Viewport", ["dojo/Evented", "dojo/on", "dojo/ready", "dojo/sniff", "dojo/_base/window", "dojo/window"], function (Evented, on, ready, has, win, winUtils) {
        var Viewport = new Evented();
        ready(200, function () {
            var oldBox = winUtils.getBox();
            Viewport._rlh = on(win.global, "resize", function () {
                var newBox = winUtils.getBox();
                if (oldBox.h == newBox.h && oldBox.w == newBox.w) {
                    return;
                }
                oldBox = newBox;
                Viewport.emit("resize");
            });
            if (has("ie") == 8) {
                var deviceXDPI = screen.deviceXDPI;
                setInterval(function () {
                    if (screen.deviceXDPI != deviceXDPI) {
                        deviceXDPI = screen.deviceXDPI;
                        Viewport.emit("resize");
                    }
                }, 500);
            }
        });
        return Viewport;
    });
}, "url:kitsonkelly/resources/_LastFMPane.html":"undefined"}});
require(["dojo/_base/array", "dojo/dom", "dojo/dom-construct", "dojo/on", "dojo/ready", "dojo/request", "dojo/router", "dijit/Tooltip", "kitsonkelly/LastFMPager"], function (array, dom, domConst, on, ready, request, router, Tooltip, LastFMPager) {
    app = {tooltips:[], items:["item01", "item02", "item03", "item04", "item05", "item06", "item07", "item11", "item12", "item13", "item14", "item15", "item16", "item17"], pages:{}};
    function connectItems() {
        if (dom.byId("labelcontent")) {
            array.forEach(app.items, function (item) {
                app.tooltips.push(new Tooltip({connectId:item, label:dom.byId(item + "content").innerHTML}));
            });
            domConst.empty("labelcontent");
        }
    }
    function initLastFM() {
        if (dom.byId("lastFM")) {
            request.get("/lastfm", {handleAs:"json"}).then(function (response) {
                app.lastFMPager = new LastFMPager({data:response}, "lastFM");
            }, function (err) {
                console.log(err);
            });
        }
    }
    function loadPage(page) {
        function placePage(response) {
            domConst.place("<div id=\"section\">" + response.content + "</div>", "section", "replace");
            domConst.place("<div id=\"header\"><h1>" + response.title + "</h1><p>" + response.subtitle + "</p></div>", "header", "replace");
            if (response.connectItems) {
                connectItems();
            }
            if (response.nav) {
                domConst.place(response.nav, "header", "after");
            }
            initLastFM();
        }
        if (dom.byId("dl")) {
            domConst.destroy("dl");
        }
        while (app.tooltips.length) {
            var tooltip = app.tooltips.pop();
            tooltip.destroyRecursive();
        }
        if (app.pages[page]) {
            placePage(app.pages[page]);
        } else {
            request.get("/page/" + page, {handleAs:"json"}).then(function (response) {
                app.pages[page] = response;
                placePage(response);
            });
        }
    }
    ready(function () {
        connectItems();
        initLastFM();
        router.register("", function () {
            loadPage("home");
        });
        router.register("dojo", function () {
            loadPage("dojo");
        });
        router.register("cv", function () {
            loadPage("cv");
        });
        router.startup();
        on(dom.byId("navhome"), "click", function (evt) {
            evt.preventDefault();
            router.go("");
        });
        on(dom.byId("navdojo"), "click", function (evt) {
            evt.preventDefault();
            router.go("dojo");
        });
        on(dom.byId("navcv"), "click", function (evt) {
            evt.preventDefault();
            router.go("cv");
        });
    });
});

