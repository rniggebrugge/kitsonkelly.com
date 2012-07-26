var profile = (function(){
	var testResourceRe = /^dojo\/tests\//,

		copyOnly = function(filename, mid){
			var list = {
				"kitsonkelly/kitsonkelly.profile":1,
				"kitsonkelly/package.json":1,
				"kitsonkelly/tests":1
			};
			return (mid in list) ||
				(/^kitsonkelly\/resources\//.test(mid) && !/\.css$/.test(filename)) ||
				/(png|jpg|jpeg|gif|tiff)$/.test(filename);
		};

	return {
		resourceTags:{
			test: function(filename, mid){
				return testResourceRe.test(mid) || mid=="dojo/tests" || mid=="dojo/robot" || mid=="dojo/robotx";
			},

			copyOnly: function(filename, mid){
				return copyOnly(filename, mid);
			},

			amd: function(filename, mid){
				return !testResourceRe.test(mid) && !copyOnly(filename, mid) && /\.js$/.test(filename);
			}
		}
	};
})();
