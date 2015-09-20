(function() {
	'use strict';
	angular
		.module('me.tomsen.restapi')
		.provider('restapiUser', providerFn);
	function providerFn() {
		var storeKey;
		var store;
		var userData;
		return {
			setStoreKey: setStoreKey,
			$get: ['$localStore', function($localStore){
				store = $localStore;
				return {
					getUserData: getUserData,
					setUserData: setUserData,
					getUserId: getUserId,
					getUserRole: getUserRole,
					getSessionToken: getSessionToken,
					isLoggedIn: isLoggedIn,
					setUser: setUser,
					clearUser: clearUser
				};
			}]
		};
		function ERestapiUserProvider(message) {
  			this.name = 'ERestapiUserProvider';
  			this.message = message;
		}
		ERestapiUserProvider.prototype = new Error();
		ERestapiUserProvider.prototype.constructor = ERestapiUserProvider;

		function checkProviderCfg(){
			if (!storeKey) {
				throw new ERestapiUserProvider('Store key is not defined. Plese config the provider with "setStoreKey" method');
			}
			if (!store) {
				throw new ERestapiUserProvider('Store is not injected. Please add the ngLocalStore module.');
			}
		}

		function getUserData() {
			return userData;
		}

		function setUserData(data) {
			userData = data;
		}

		function setStoreKey(value){
			storeKey = value;
		}

		function getUser(){
			checkProviderCfg();
			return store.get(getStoreKey()) || {};
		}

		function getUserRole(){
			var user = getUser();
			return user.role;
		}

		function getSessionToken(){
			var user = getUser();
			return user.sessionToken;
		}

		function getUserId(){
			var user = getUser();
			return user.id;
		}

		function isLoggedIn(){
			var user = getUser();
			return user && user.id && user.role && user.sessionToken;
		}

		function getStoreKey() {
			return storeKey+'-restapi-user';
		}

		function setUser(userId, userRole, sessionToken) {
			checkProviderCfg();
			store.put(getStoreKey(), {id: userId, role: userRole, sessionToken: sessionToken});
		}

		function clearUser() {
			checkProviderCfg();
			store.remove(getStoreKey());
			userData = null;
		}
	}
})();