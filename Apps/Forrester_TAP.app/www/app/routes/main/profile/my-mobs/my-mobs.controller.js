(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('MyMobsController', MyMobsController);

    MyMobsController.$inject = ['ObservationService', 'AnalyticsService', 'TapDetailsModalService'];

    function MyMobsController (ObservationService, AnalyticsService, TapDetailsModalService) {
        var self = this;

        self.items = [];
        self.loaded = false;

        self.showMobDetails = showMobDetails;

        activate();

        function activate () {
            AnalyticsService.screenView('My Mobs');
            AnalyticsService.recordEvent("PROFILE", "5 - User Profile", {}, {
                "ctx_MOBs": 1,
                "ctx_Settings": 0
            });

            ObservationService.upvotedObservationFeed()
                .then(response => self.items = response.data)
                .catch(err => console.error(err))
                .finally(() => self.loaded = true);
        }

        function showMobDetails (mob) {
            TapDetailsModalService.showMobDetails(mob, null);
        }
    }
})();
