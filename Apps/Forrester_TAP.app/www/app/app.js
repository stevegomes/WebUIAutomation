(function () {
    'use strict';

    // more stringent uri encoding (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
    // for some reason api gateway will give a nasty error if query params contain !'()*
    (function () {
        let standardEncodeURIComponent = encodeURIComponent;
        encodeURIComponent = string => standardEncodeURIComponent(string).replace(/[!'()*]/g, function (c) {
            return '%' + c.charCodeAt(0).toString(16).toUpperCase();
        });
    })();

    angular
        .module('ftap', [ 'ionic', 'ui.validate', 'ngLodash', 'ngCordova', 'angularMoment', 'ngclamp-js' ])
        .config(function ($ionicConfigProvider) {
            $ionicConfigProvider.tabs.position('bottom');
            $ionicConfigProvider.tabs.style('standard');
            $ionicConfigProvider.navBar.alignTitle('center');
            $ionicConfigProvider.views.maxCache(0);
        })
        .run(function (FTAP_CONFIG) {
            var firstScriptTag = document.getElementsByTagName('script')[0],
                tag = document.createElement('script');

            tag.src = 'https://maps.googleapis.com/maps/api/js?key=' + FTAP_CONFIG.GOOGLE_API_KEY + '&libraries=places';
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        })
        .run(function ($ionicPlatform, $cordovaKeyboard) {
            $ionicPlatform.ready(function() {
                $cordovaKeyboard.hideAccessoryBar(true);
                $cordovaKeyboard.disableScroll(true);
            });
        })
        .run(function ($rootScope, $window, $state) {
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
                if (angular.isDefined($window.NativeTap) && fromState && fromState.native) {
                    NativeTap.hide();
                }
            });
        })
        .run(PushNotificationService => {
            PushNotificationService.checkIfEnabled().then(PushNotificationService.register);
        })
        .run(($ionicPlatform, LocationService) => {
            if (localStorage.ONBOARDING_COMPLETE) {
                LocationService.startUp();
                $ionicPlatform.on('resume', LocationService.startUp);
            }
        }).run(($ionicPlatform, AnalyticsService) => {
            AnalyticsService.recordStart();

            $ionicPlatform.on('resume', AnalyticsService.recordResume);
        });
})();
