(function() {
	'use strict';
	angular
		.module('me.tomsen.restapi')
		.factory('restapiUser', factoryFn);

	factoryFn.$inject = ['restapi', '$localstore'];

	function factoryFn(restapi, $localstore) {
		var userData;
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

		function getUserData() {
			return userData;
		}

		function setUserData(data) {
			userData = data;
		}

		function getUser(){
			return $localstore.get(getUserKey()) || {};
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

		function setUser(userId, userRole, sessionToken) {
			$localstore.put(getUserKey(), {id: userId, role: userRole, sessionToken: sessionToken});
		}

		function getUserKey() {
			return restapi.getStoreKey()+'-restapi-user';
		}

		function clearUser() {
			$localstore.remove(getUserKey());
			userData = null;
		}
	}
})();