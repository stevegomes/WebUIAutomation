(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('SignupController', SignupController);

    SignupController.$inject = ['$state', '$ionicLoading', 'AuthService'];

    function SignupController ($state, $ionicLoading, AuthService) {
        this.emailSignup = emailSignup;
        this.facebookSignup = facebookSignup;
        this.validateLength = validateLength;
        this.validateNumber = validateNumber;
        this.validateCapital = validateCapital;
        this.validateLower = validateLower;
        this.validateSpecial = validateSpecial;
        this.validateMatch = validateMatch;
        this.validateExists = validateExists;
        this.validateAlphanum = validateAlphanum;

        function emailSignup (input, form) {
            input = input || {};

            // TODO validation

            $ionicLoading.show().then(() => {
                AuthService
                // TODO remove `name` requirement from user pool
                .emailSignup('Manual Signup User', input.email, input.username, input.password)
                .then(() => {
                    $ionicLoading.hide();
                    $state.go('auth.signup-success', { hasFacebook: false });
                })
                .catch(err => {
                    console.error(err);
                    $ionicLoading.hide();

                    if (err.message.indexOf('Invalid email address format') > -1) { // Amazon's email address requirements are stricter than angular's
                        form.email.$setValidity('email', false);
                    } else if (err.message.indexOf('User already exists') > -1) {
                        form.username.$setValidity('exists', false);
                    }
                });
            });
        }

        function facebookSignup () {
            $ionicLoading.show()
                .then(() => AuthService.facebookAuth())
                .then(() => $state.go('auth.signup-success', { hasFacebook: true }))
                .catch(err => {
                    console.log(JSON.stringify(err));
                    alert(JSON.stringify(err));
                })
                .finally(() => $ionicLoading.hide());
        }

        function validateLength (value) {
            value = (value || '') + '';
            return value.length >= 8 && value.length <= 25;
        }

        function validateNumber (value) {
            return /\d/.test(value || '');
        }

        function validateCapital (value) {
            return /[A-Z]/.test(value || '');
        }

        function validateLower (value) {
            return /[a-z]/.test(value || '');
        }

        function validateSpecial (value) {
            return /[!"#\$%&'\(\)\*\+,-\./:;<=>\?@\[\]\^_`\{\|\}~]/.test(value || '');
        }

        function validateMatch (value1, value2) {
            value1 = (value1 || '') + '';
            value2 = (value2 || '') + '';
            return value1 && value2 && (value1 === value2);
        }

        function validateExists () {
            return true; // this just clears out any validation errors on change
        }

        function validateAlphanum (value) {
            value = (value || '') + '';
            return (value === '') || /^[a-z0-9]+$/i.test(value);
        }
    }
})();
