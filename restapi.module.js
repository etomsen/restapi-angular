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
							deferred.reject(response);
		    				return $q.reject(response);
		    			}
		    			if (response.data === null && response.status === 0 && response.statusText === '') {
		    				var $http = $injector.get('$http');
		    				var deferred = $q.defer();
		    				$http.get('http://ip-api.com/json/')
						    	.success(function(){
						    		console.info('My great page is loaded - We are online :)', arguments);
						    		response.noNetwork = false;
									deferred.reject(response);
						    	})
						    	.error(function(){
						    		console.info('ERROR: My great online page is not loaded :/ - possibility of connection loss?',arguments);
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
