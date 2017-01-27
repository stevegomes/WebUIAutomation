(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('NearbyListController', NearbyListController);

    NearbyListController.$inject = ['AnalyticsService'];

    function NearbyListController (AnalyticsService) {
        var self = this;

        activate();

        function activate () {
            AnalyticsService.screenView('Nearby List');
        }
    }
})();
