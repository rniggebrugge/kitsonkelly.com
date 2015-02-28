define([
	'../compose',
	'../global',
	'./_Storage'
], function (compose, global, _Storage) {
	'use strict';

	var localStorage = global.window && global.window.localStorage;
	
	return compose(_Storage, {
		storage: localStorage
	});
});