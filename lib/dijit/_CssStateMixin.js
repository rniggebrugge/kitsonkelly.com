//>>built
define("dijit/_CssStateMixin","dojo/_base/array,dojo/_base/declare,dojo/dom,dojo/dom-class,dojo/_base/lang,dojo/on,dojo/ready,dojo/_base/window,./registry".split(","),function(f,h,k,g,l,m,n,o,i){h=h("dijit._CssStateMixin",[],{cssStateNodes:{},hovering:!1,active:!1,_applyAttributes:function(){this.inherited(arguments);f.forEach("disabled,readOnly,checked,selected,focused,state,hovering,active,_opened".split(","),function(a){this.watch(a,l.hitch(this,"_setStateClass"))},this);for(var a in this.cssStateNodes)this._trackMouseState(this[a],
this.cssStateNodes[a]);this._trackMouseState(this.domNode,this.baseClass);this._setStateClass()},_cssMouseEvent:function(a){if(!this.disabled)switch(a.type){case "mouseover":this._set("hovering",!0);this._set("active",this._mouseDown);break;case "mouseout":this._set("hovering",!1);this._set("active",!1);break;case "mousedown":case "touchstart":this._set("active",!0);break;case "mouseup":case "touchend":this._set("active",!1)}},_setStateClass:function(){function a(a){b=b.concat(f.map(b,function(c){return c+
a}),"dijit"+a)}var b=this.baseClass.split(" ");this.isLeftToRight()||a("Rtl");var e="mixed"==this.checked?"Mixed":this.checked?"Checked":"";this.checked&&a(e);this.state&&a(this.state);this.selected&&a("Selected");this._opened&&a("Opened");this.disabled?a("Disabled"):this.readOnly?a("ReadOnly"):this.active?a("Active"):this.hovering&&a("Hover");this.focused&&a("Focused");var e=this.stateNode||this.domNode,c={};f.forEach(e.className.split(" "),function(a){c[a]=!0});"_stateClasses"in this&&f.forEach(this._stateClasses,
function(a){delete c[a]});f.forEach(b,function(a){c[a]=!0});var d=[],j;for(j in c)d.push(j);e.className=d.join(" ");this._stateClasses=b},_subnodeCssMouseEvent:function(a,b,e){function c(c){g.toggle(a,b+"Active",c)}if(!this.disabled&&!this.readOnly)switch(e.type){case "mouseover":g.toggle(a,b+"Hover",!0);break;case "mouseout":g.toggle(a,b+"Hover",!1);c(!1);break;case "mousedown":case "touchstart":c(!0);break;case "mouseup":case "touchend":c(!1);break;case "focus":case "focusin":g.toggle(a,b+"Focused",
!0);break;case "blur":case "focusout":g.toggle(a,b+"Focused",!1)}},_trackMouseState:function(a,b){a._cssState=b}});n(function(){function a(a){if(!k.isDescendant(a.relatedTarget,a.target))for(var d=a.target;d&&d!=a.relatedTarget;d=d.parentNode)if(d._cssState){var b=i.getEnclosingWidget(d);b&&(d==b.domNode?b._cssMouseEvent(a):b._subnodeCssMouseEvent(d,d._cssState,a))}}function b(c){c.target=c.srcElement;a(c)}var e=o.body();f.forEach("mouseover,mouseout,mousedown,touchstart,mouseup,touchend".split(","),
function(c){e.addEventListener?e.addEventListener(c,a,!0):e.attachEvent("on"+c,b)});m(e,"focusin, focusout",function(a){var b=a.target;b._cssState&&!b.getAttribute("widgetId")&&i.getEnclosingWidget(b)._subnodeCssMouseEvent(b,b._cssState,a)})});return h});