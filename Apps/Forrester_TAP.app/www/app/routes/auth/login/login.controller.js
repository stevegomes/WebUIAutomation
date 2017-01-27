(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$state', '$ionicLoading', '$cordovaDialogs', 'AuthService'];

    function LoginController ($state, $ionicLoading, $cordovaDialogs, AuthService) {
        this.emailLogin = emailLogin;
        this.facebookLogin = facebookLogin;

        function emailLogin (input) {
            input = input || {};

            $ionicLoading.show().then(
                () => {
                    AuthService
                    .emailLogin(input.username, input.password)
                    .then(() => {
                        $ionicLoading.hide();
                        $state.go(localStorage.ONBOARDING_COMPLETE ? 'main.tap' : 'onboarding');
                    })
                    .catch(result => {
                        $ionicLoading.hide();
                        console.error(JSON.stringify(result));
                        $cordovaDialogs.alert('Please check your login information and try again.', 'Login Error', 'OK');
                    });
                }
            );
        }

        function facebookLogin () {
            $ionicLoading.show()
                .then(() => AuthService.facebookAuth())
                .then(() => $state.go(localStorage.ONBOARDING_COMPLETE ? 'main.tap' : 'onboarding'))
                .catch(err => {
                    // TODO real error message
                    alert(JSON.stringify(err));
                })
                .finally(() => $ionicLoading.hide());
        }
    }
})();
