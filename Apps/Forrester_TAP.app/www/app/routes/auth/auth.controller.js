(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['$stateParams', '$rootScope', '$window', '$state', '$ionicPlatform', 'AuthService', 'isLoggedInFacebook', 'isAnonymous'];

    function AuthController ($stateParams, $rootScope, $window, $state, $ionicPlatform, AuthService, isLoggedInFacebook, isAnonymous) {
        this.useFacebook = true;

        this.toggleFacebook = toggleFacebook;

        activate();

        function activate() {
            if ($stateParams.reload) {
                return $window.location.reload(true)
            }

            $ionicPlatform.ready(() => {
                if (angular.isDefined($window.navigator) && angular.isDefined($window.navigator.splashscreen)) {
                    $window.navigator.splashscreen.hide();
                }
            });

            $state.go(localStorage.ONBOARDING_COMPLETE ? 'main.tap' : 'onboarding');
        }

        function toggleFacebook () {
            this.useFacebook = !this.useFacebook;
        }
    }
})();
