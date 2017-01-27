// Subscribe user to push notifications
(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('PushNotificationService', PushNotificationService);

    PushNotificationService.$inject = [
        '$q', '$state', '$window', '$ionicPlatform', 'FTAP_CONFIG', 'ApiService', 'PlatformService',
        'EnableNotificationModalService', 'UserService'
    ];

    function PushNotificationService($q, $state, $window, $ionicPlatform, FTAP_CONFIG, ApiService, PlatformService,
        EnableNotificationModalService, UserService) {

        const service = {
            hasSeenNudge,
            hasSubscribed,
            promptToEnable,
            register,
            subscribe,
            checkIfEnabled,
        };

        function hasSeenNudge () {
            return $window.localStorage.getItem('PUSH_NOTIFICATION_NUDGE_SEEN') === 'true';
        }

        function hasSubscribed () {
            return $window.localStorage.getItem('DEVICE_HAS_REGISTERED_FOR_PUSH') === 'true';
        }

        function promptToEnable () {
            $window.localStorage.setItem('PUSH_NOTIFICATION_NUDGE_SEEN', 'true');

            return EnableNotificationModalService.showModal().then(() => service.register());
        }

        function register () {
            $ionicPlatform.ready(() => {
                if ($window.PushNotification) {
                    const push = $window.PushNotification.init({
                        android: {
                            senderID: FTAP_CONFIG.GCM_SENDER_ID,
                            icon: 'ic_stat_droid_notification',
                            iconColor: '#003D99',
                        },
                        ios: {
                            alert: true
                        },
                    });

                    if (!hasSubscribed()) {
                        push.on('registration', data =>
                            subscribe(data.registrationId, PlatformService.isIOS() ? 'ios' : 'android')
                        );
                    }

                    push.on('notification', () => $state.go('main.profile.my-mobs'));

                    push.on('error', err => console.error(err));
                }
            });
        }

        function subscribe (token, platform) {
            ApiService.request('registerdevicePost', {}, {token, platform}, {}).then(() =>
                $window.localStorage.setItem('DEVICE_HAS_REGISTERED_FOR_PUSH', 'true')
            ).catch(err => console.error(err));
        }

        function checkIfEnabled () {
            if (angular.isUndefined($window.PushNotification)) {
                UserService.notifs = 0;
                return $q.reject('Push notification plugin not present');
            }

            return $q(
                (resolve, reject) => PushNotification.hasPermission(data => {
                    if (data.isEnabled) {
                        UserService.notifs = 1;
                        resolve();
                    } else {
                        UserService.notifs = 0;
                        reject('Push notifications not enabled');
                    }
                })
            );
        }

        return service;
    }
})();
