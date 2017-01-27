(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('TapDetailsModalController', TapDetailsModalController);

    TapDetailsModalController.$inject = [
        '$q', '$window', '$state', '$timeout', '$ionicLoading', 'LocationService', 'TapDetailsModalService',
        'ObservationService', 'TapParamsService', 'AnalyticsService'
    ];

    function TapDetailsModalController($q, $window, $state, $timeout, $ionicLoading, LocationService,
        TapDetailsModalService, ObservationService, TapParamsService, AnalyticsService) {
        const self = this;

        self.hasPlace = false;
        self.place = null;
        self.loaded = false;
        self.mobs = [];

        self.tapScreen = tapScreen;
        self.closeModal = closeModal;
        self.viewMobs = viewMobs;

        activate();

        function activate() {
            AnalyticsService.screenView('Tap Details');

            var getDetailsPromise;

            // Only places should go through the google maps api...
            if (TapDetailsModalService.category === "places") {
                getDetailsPromise = LocationService.getPlaceDetails(
                    !!TapDetailsModalService.mob
                        ? TapDetailsModalService.mob.place_id
                        : TapDetailsModalService.placeId
                );
            }

            // Things and People should just return the necessary data for the modal
            else {
                getDetailsPromise = $q((resolve, reject) => {
                    resolve(TapDetailsModalService.mob);
                });
            }

            let getListPromise = (
                !!TapDetailsModalService.mob
                    ? ObservationService.getRelatedTaps(TapDetailsModalService.mob.combinedDescription)
                    : ObservationService.getTapsForLocation(TapDetailsModalService.placeId)
            );

            $ionicLoading.show()
                .then(() => $q.all([
                    // retrieve place name + address
                    getDetailsPromise.then(place => self.place = place),

                    // retrieve taps/mobs for place
                    getListPromise.then(data => self.mobs = data)
                ]))
                .catch(error => console.error(error))
                .finally(() => {
                    self.loaded = true;
                    $ionicLoading.hide();
                });
        }

        function closeModal(clear) {
            /**
             * .hide() hides it from view via an animation, but keeps it in the DOM
             * because of which, the more modals you open (or the more times you open the same modal) the DOM keeps getting filled
             * .remove() removes the element(s) from DOM
             *
             * however, calling only .remove() makes the modal disappear, no animation
             * that's why it is chained with .hide().then()
             */

            return TapDetailsModalService.modal.hide()
                .then(() => TapDetailsModalService.modal.remove());
        }

        function tapScreen(rating) {
            if (angular.isDefined($window.NativeTap)) {
                TapDetailsModalService.modal.remove();
                NativeTap.openLocationTap(self.place, rating, null);
                AnalyticsService.recordEvent("TAP", "4.1.1 - Tap Details", {
                    "ctx_sentiment": rating,
                    "ctx_locName": self.place ? self.place.name : "N/A",
                    "ctx_locAddress": self.place ? self.place.formatted_address : "N/A"
                }, {});
            }
        }

        function viewMobs(item) {
            if (item.upvoteCount) {
                ObservationService.placeToView = {
                    title: item.title,
                    placeId: item.place_id
                };

                $state.go('main.mobs').then(
                    () => TapDetailsModalService.modal.remove() // remove modal right away with no animation
                );
            }
        }
    }
})();
