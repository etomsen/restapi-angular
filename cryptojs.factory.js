(function(){
	'use strict';

	angular
		.module('me.tomsen.restapi')
		.factory('cryptojs', ['$window', factoryFn]);

	function factoryFn($window) {
		var cryptojs = $window.CryptoJS || {};
		cryptojs.sha256encBase64 = function(value) {
	    	var h = cryptojs.SHA256 ? cryptojs.SHA256(value) : '';
	    	cryptojs.enc = cryptojs.enc || {};
	    	return h.toString(cryptojs.enc.Base64);
	  	};
	  	cryptojs.restapiHash = cryptojs.sha256encBase64;
	  	return cryptojs;
	}
})();