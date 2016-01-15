(function(){
	'use strict';
	angular.module('me.tomsen.restapi', ['ngLocalStore', 'ng'])
		.config(['$httpProvider', function($httpProvider) {
		    $httpProvider.interceptors.push(['$q', '$injector', function($q, $injector) {
		    	return {
		    		responseError: function(response) {
		    			console.log('restapi.module.responseError: res='+JSON.stringify(response));
		    			if (!response.config || response.config.url === 'http://ip-api.com/json/')  {
		    				response.noNetwork = true;
							return $q.reject(response);
		    			}
		    			if (response.data === null && response.status === 0 && response.statusText === '') {
		    				var $http = $injector.get('$http');
		    				var deferred = $q.defer();
		    				$http.get('http://ip-api.com/json/', {'timeout': 500})
						    	.success(function(){
						    		console.info('RESTAPI service is reached. We are online.', arguments);
						    		response.noNetwork = false;
									deferred.reject(response);
						    	})
						    	.error(function(){
						    		console.info('ERROR: RESTAPI service was not reached. Possibility of connection loss.', arguments);
						    		response.noNetwork = true;
									deferred.reject(response);
						    	});
						    return deferred.promise;
		                }
		                return $q.reject(response);
		            }
		        };
		    }]);
		}]);
})();
