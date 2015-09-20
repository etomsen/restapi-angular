(function(){
	'use strict';
	angular
		.module('me.tomsen.restapi')
		.factory('restapi', factoryFn);

	factoryFn.inject = ['$localStore', '$http', '$q', 'cryptojs', 'restapiUser'];

	function factoryFn($localStore, $http, $q, cryptojs, restapiUser) {
		var httpTimeout = 20000;

		return {
			getAuth: getAuth,
			postAuth: postAuth,
			post: post,
			get: get,
			http: http,
			getServerUrl: getServerUrl,
			setServerUrl: setServerUrl,
			healthCheckAuth: healthCheckAuth,
			isErrorLogout: isErrorLogout
		};

		function isErrorLogout(error) {
			if (error.errorCode === 'restapi.error.403.40304') {
				return true;
			}
			if (error.errorCode === 'restapi.error.401.40101') {
				return true;
			}
			return false;
		}

		function healthCheckAuth() {
			return getAuth('healthcheck/auth');
		}


		function parseResponse(response, obj) {
			response = response || {};
			if (response.noNetwork) {
				obj.errorCode = 'restapi.error.noNetwork';
				obj.noNetwork = true;
				return;
			}
            obj.status = response.status;
            if (response.status === 200) {
            	obj.data = response.data;
            	return true;
            }
            obj.status = response.status;
            var validErrorStates = {
            	400: {null: true},
            	401: {40101: true, 40102: true},
            	403: {40301: true, 40302: true, 40304: true},
            	404: {null: true, 40402: true, 40403: true, 40407: true},
            	409: {40905: true},
            	500: {50002: true},
            	505: {50501: true}
            };
            if (validErrorStates[response.status]) {
            	if (response.data && response.data.errorCode) {
            		obj.responseErrorCode = response.data.errorCode;
            	} else {
            		obj.responseErrorCode = null;
            	}
            	if (validErrorStates[obj.status][obj.responseErrorCode]) {
					obj.errorCode = 'restapi.error.{0}.{1}'.f(obj.status, obj.responseErrorCode);
				} else {
					obj.errorCode = 'restapi.error.unknown';
				}
            } else {
            	obj.errorCode = 'restapi.error.unknown';
            }
            if (response.data) {
            	obj.responseApplicationMessage = response.data.applicationMessage;
            	obj.responseConsumerMessage = response.data.consumerMessage;
            }
            obj.restapiError = true;
			return false;
        }

		function post(url, data) {
			data = data || {};
			var request = {
				method: 'POST',
				url: getServerUrl() + '/' + url,
				headers: {
					'Content-Type': 'application/json'
				},
				data: data,
				timeout: httpTimeout
			};

			return http(request);

		}

		function get(url, data) {
			data = data || {};
			var request = {
				method: 'GET',
				url: getServerUrl() + '/' + url,
				headers: {
					'Content-Type': 'application/json'
				},
				data: data,
				timeout: httpTimeout
			};
			return http(request);
		}

		function getParams(data) {
			if (!data || !data.params) {
				return '';
			}
			var result = '';
			for (var param in data.params) {
				if (data.params.hasOwnProperty(param)) {
					if (!result) {
						result = '{0}={1}'.f(param, data.params[param]);
					} else {
						result = '{0}&{1}={2}'.f(result, param, data.params[param]);
					}
				}
			}
			return result;
		}

		function getAuth(url, data) {
			data = data || {};
			// var fullUrl = '{0}/{1}'.f(serverUrl, url);
			var params = getParams(data);
			var fullUrl;
			if (params) {
				fullUrl = '{0}/{1}?{2}'.f(getServerUrl(), url, getParams(data));
			} else {
				fullUrl = '{0}/{1}'.f(getServerUrl(), url);
			}
			var request = {
				method: 'GET',
				url: fullUrl,
				headers: getAuthHeader(url, 'GET'),
				data: data,
				timeout: httpTimeout
			};
			return http(request);
		}

		function postAuth(url, data) {
			data = data || {};
			var params = getParams(data);
			var fullUrl;
			if (params) {
				fullUrl = '{0}/{1}?{2}'.f(getServerUrl(), url, getParams(data));
			} else {
				fullUrl = '{0}/{1}'.f(getServerUrl(), url);
			}
			var request = {
				method: 'POST',
				url: fullUrl,
				headers: getAuthHeader(url, 'POST'),
				data: data,
				timeout: httpTimeout
			};
			return http(request);
		}

		function http(request) {
			var deferred = $q.defer();
			$http(request).then(
				function(response) {
	    			var parseResponseObj = {};
                    if (parseResponse(response, parseResponseObj)) {
                    	deferred.resolve(parseResponseObj.data);
                    } else {
                    	if (isErrorLogout(parseResponseObj)) {
                    		parseResponseObj.isErrorLogout = true;
                    	}
                    	deferred.reject(parseResponseObj);
                    }

	    		}, function(error) {
	    			var parseResponseObj = {};
				    parseResponse(error, parseResponseObj);
				    if (isErrorLogout(parseResponseObj)) {
                    	parseResponseObj.isErrorLogout = true;
                    }
				    deferred.reject(parseResponseObj);
				});
			return deferred.promise;

		}

		function setServerUrl(value) {
			$localStore.put('tao-server-url', value);
		}

		function getServerUrl() {
			// return 'http://10.7.97.13:8080';
			// return 'http://localhost:8080';
			return 'https://taommg.edp-progetti.it/taotouchserver';
			// return $localStore.get('tao-server-url') || 'https://taommg.edp-progetti.it/taotouchserver';
		}

		function getIsoDate() {
			var d = new Date();
	        function pad(n) {
	            return n < 10 ? '0' + n : n;
	        }
	        return '{0}-{1}-{2}T{3}:{4}:{5}Z'.f(d.getUTCFullYear(), pad(d.getUTCMonth() + 1), pad(d.getUTCDate()), pad(d.getUTCHours()), pad(d.getUTCMinutes()), pad(d.getUTCSeconds()));
	    }

	    function makeRandomString() {
	        return Math.random()
	            .toString(36)
	            .substring(2, 15) + Math.random()
	            .toString(36)
	            .substring(2, 15);
	    }

		function getAuthHeader(url, method) {
	        var userId = restapiUser.getUserId();
	        var sessionToken = restapiUser.getSessionToken();
	        if (!userId || !sessionToken) {
	            return null;
	        }
	        var time = getIsoDate();
	        var nonce = makeRandomString();
	        var stringToHash = '{0}:{1},{2},{3},{4}'.f(sessionToken, url, method, time, nonce);
	        var authorization = '{0}:{1}'.f(userId, cryptojs.restapiHash(stringToHash));
	        return {
	        	'Content-Type': 'application/json',
	            'Authorization': authorization,
	            'x-me-tomsen-restapi-date': time,
	            'nonce': nonce
	        };
	    }
	}
})();