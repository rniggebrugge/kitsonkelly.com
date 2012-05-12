require([
  "dojo/dom",
  "dojo/ready",
  "dijit/form/Button"
], function(dom, ready, Button){
  ready(function(){
    var button = new Button({
      label: "Hello World"
    }, "output");
  });
})