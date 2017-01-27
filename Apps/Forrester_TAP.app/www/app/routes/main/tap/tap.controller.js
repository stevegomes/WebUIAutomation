(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('TapController', TapController);

    TapController.$inject = ['AnalyticsService'];

    function TapController (AnalyticsService) {
        const self = this;

        activate();

        function activate () {
            AnalyticsService.screenView('Main Tap');
        }
    }
})();
