(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('SignupSuccessController', SignupSuccessController);

    SignupSuccessController.$inject = ['$ionicLoading', '$stateParams', '$cordovaDialogs', '$state', 'AuthService'];

    function SignupSuccessController ($ionicLoading, $stateParams, $cordovaDialogs, $state, AuthService) {
        const self = this;

        self.getLink = getLink;

        activate();

        function activate () {
            if (!$stateParams.hasFacebook) {
                $cordovaDialogs.confirm("When you connect your Facebook account you'll be able to connect with " +
                    "your Facebook friends that are using the Tap app.", 'Connect with Facebook', ['No, Thanks','OK'])
                .then(buttonIndex => {
                    if (buttonIndex == 1) {
                        // No, Thanks
                        $cordovaDialogs.alert('If you change your mind you can connect your' +
                            ' Tap profile with Facebook in your Profile Settings. ', 'Connect with Facebook', 'OK');
                    } else if (buttonIndex == 2) {
                        // OK
                        $ionicLoading.show()
                            .then(() => AuthService.facebookLink())
                            .then(result => {
                                $cordovaDialogs.alert('Successfully linked your Tap profile with Facebook!',
                                    'Connect with Facebook', 'OK'
                                );

                                console.log(result);
                            })
                            .catch(err => {
                                $cordovaDialogs.alert('There was an error connecting your Tap profile with '
                                    + 'Facebook.  You can try again later in your Profile Settings.',
                                    'Connect with Facebook', 'OK'
                                );

                                console.log(err);
                            })
                            .finally(() => $ionicLoading.hide());
                    }
                });
            }
        }

        function getLink () {
            return $state.href(localStorage.ONBOARDING_COMPLETE ? 'main.tap' : 'onboarding');
        }
    }
})();
