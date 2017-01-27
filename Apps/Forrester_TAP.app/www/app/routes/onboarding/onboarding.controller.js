(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('OnboardingController', OnboardingController);

    OnboardingController.$inject = [
        '$scope', '$window', '$ionicPlatform', '$state', 'LocationService', 'AnalyticsService'
    ];

    function OnboardingController ($scope, $window, $ionicPlatform, $state, LocationService, AnalyticsService) {
        const self = this;

        self.showLocationScreen = false;
        self.sliderDelegate = null;
        self.options = {
            prevButton: '.ft-onboarding-button-prev',
            nextButton: '.ft-onboarding-button-next'
        };

        self.next = next;
        self.activateLocationServices = activateLocationServices;
        self.close = close;

        $scope.$on('$ionicSlides.slideChangeEnd', () => {
            $scope.$digest(); // ensure that `self.sliderDelegate` properties update
        });

        activate();

        function activate () {
            AnalyticsService.screenView('Onboarding Slides');
        }

        function next () {
            AnalyticsService.screenView('Enable Location');

            self.showLocationScreen = true;
        }

        function activateLocationServices () {
            LocationService.startUp();
            $ionicPlatform.on('resume', LocationService.startUp);
            self.close();
        }

        function close () {
            localStorage.ONBOARDING_COMPLETE = true;
            $state.go('main.tap');
        }
    }
})();
