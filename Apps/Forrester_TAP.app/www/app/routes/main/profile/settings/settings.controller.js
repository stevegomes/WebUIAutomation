(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('SettingsController', SettingsController);

    SettingsController.$inject = [
        '$scope', '$state', '$window', '$timeout', '$ionicModal', '$cordovaDialogs', '$ionicLoading', 'FTAP_CONFIG',
        'AuthService', 'SharingService', 'AnalyticsService'
    ];

    function SettingsController ($scope, $state, $window, $timeout, $ionicModal, $cordovaDialogs, $ionicLoading,
        FTAP_CONFIG, AuthService, SharingService, AnalyticsService) {
        var self = this;

        self.sharing = SharingService;
        self.showDebugInfo = FTAP_CONFIG.SHOW_DEBUG_INFO;
        self.versionNumber = FTAP_CONFIG.VERSION_NUMBER;

        self.connectToFacebook = connectToFacebook;
        self.disconnectFromFacebook = disconnectFromFacebook;
        self.logOut = logOut;
        self.displayTermsAndConditions = displayTermsAndConditions;

        $scope.closeModal = () => self.modal && self.modal.hide();

        activate();

        function activate () {
            AnalyticsService.screenView('Settings');
            AnalyticsService.recordEvent("PROFILE", "5 - User Profile", {}, {
                "ctx_MOBs": 0,
                "ctx_Settings": 1
            });
        }

        function connectToFacebook () {
            $ionicLoading.show()
                .then(() => AuthService.facebookLink())
                .then(() => $state.go($state.current, {}, { reload: true }))
                .catch(err => {
                    $cordovaDialogs.alert('There was an error connecting your Tap profile with Facebook.',
                        'Connect with Facebook', 'OK'
                    );
                    console.error(JSON.stringify(err));
                })
                .finally(() => $ionicLoading.hide());
        }

        function disconnectFromFacebook () {
            $ionicLoading.show()
                .then(() => AuthService.facebookUnlink())
                .then(() => $state.go($state.current, {}, { reload: true }))
                .catch(err => {
                    $cordovaDialogs.alert('There was an error disconnecting your Tap profile from Facebook.',
                        'Disconnect from Facebook', 'OK'
                    );

                    console.error(JSON.stringify(err));
                })
                .finally(() => $ionicLoading.hide());
        }

        // Open terms and conditions popup
        function displayTermsAndConditions () {
            $ionicModal.fromTemplateUrl('app/routes/main/profile/settings/terms-and-conditions-modal.html', {
                backdropClickToClose: false,
                scope: $scope,
            }).then(modal => {
                self.modal = modal;
                self.modal.show();
            });
        }

        function logOut () {
            AuthService.logOut()
                .then(() => {
                    if (angular.isDefined($window.navigator) && angular.isDefined($window.navigator.splashscreen)) {
                        $window.navigator.splashscreen.show();
                    }

                    return $state.go('auth.signup', { reload: true });
                });
        }
    }
})();
