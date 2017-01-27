(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('NearbyController', NearbyController);

    NearbyController.$inject = [
        '$state', '$timeout', '$scope', '$cordovaDialogs', '$ionicModal', 'lodash', 'IOIService', 'LocationService',
        'TapDetailsModalService', 'AnalyticsService'
    ];

    function NearbyController (
        $state, $timeout, $scope, $cordovaDialogs, $ionicModal, lodash, IOIService, LocationService,
        TapDetailsModalService, AnalyticsService) {
        var self = this;

        self.locationResults = [];
        self.locationSearchString = '';
        self.filterLocation = ''; // location search string
        self.filterCategories = []; // categories to filter; empty returns all categories
        self.filterPlace = null; // location filter place; use current location if falsy
        self.filterRatings = null; // which ratings to show; will be set in filter modal
        self.filterMobsOnly = false;
        self.loaded = false;
        self.items = null;

        self.loadLocations = loadLocations;
        self.openFilter = openFilter;
        self.locationSearch = locationSearch;
        self.selectLocation = selectLocation;
        self.viewTaps = viewTaps;
        self.getActiveCategories = getActiveCategories;

        activate();

        function activate () {
            loadLocations();
        }

        function loadLocations (coords, categories) {
            categories = categories || [];

            self.items = null;
            self.loaded = false;
            $scope.$broadcast('nearbyLoadStart');

            IOIService.getNearby(coords, categories)
                .then(response => {
                    self.items = response.items;
                    let numMOBs = self.items.reduce((sum, el) => sum += el.isMob, 0);
                    $scope.$broadcast('nearbyLoadSuccess', response.items, response.boundingBox);

                    let filterCategories = lodash.compact(response.categories).sort().map(label => ({
                        label,
                        active: categories.indexOf(label) !== -1 // active if category was previously selected
                    }));
                    angular.copy(filterCategories, self.filterCategories); // preserve object reference

                    let searchObj = {};
                    response.items.forEach((el, idx) => {
                        searchObj['ctx_score_' + (idx + 1)] = el.rating;
                        searchObj['ctx_name_' + (idx + 1)] = el.title;
                        searchObj['ctx_distance_' + (idx + 1)] = el.distance;
                    });

                    AnalyticsService.recordEvent("NEARBY", "4.1 - Nearby", searchObj, {
                        "ctx_Map" : $state.current.name.indexOf('map') !== -1 ? 1: 0,
                        "ctx_MOBs" : numMOBs ? 1 : 0,
                        "ctx_numMOBs" : numMOBs
                    });
                })
                .catch(err => {
                    $cordovaDialogs.alert('Unable to load location data.', 'Location Error', 'OK');
                    $scope.$broadcast('nearbyLoadError');
                })
                .finally(() => self.loaded = true);
        }

        function openFilter () {
            let scope = $scope.$new();
            let oldCategories = self.getActiveCategories();

            scope.closeModal = () => scope.modal && scope.modal.hide();

            scope.$on('$destroy', () => {
                scope && scope.modal && scope.modal.remove();
            });

            scope.$on('modal.hidden', function () {
                let categories = self.getActiveCategories();

                if (!angular.equals(categories, oldCategories)) {
                    loadLocations(self.filterPlace ? self.filterPlace.coords : null, categories);
                }

                self.filterMobsOnly = scope.options.mobsOnly;
                self.filterRatings = scope.options.ratings;

                let screenName = $state.current.name.indexOf('map') !== -1
                    ? 'Nearby Map'
                    : 'Nearby List';

                AnalyticsService.recordEvent('FILTER_DISMISS', screenName, {
                    ctx_filterCategories: categories.join(',') || 'all'
                }, {
                    ctx_mobsOnly: scope.options.mobsOnly ? 1 : 0,
                    ctx_myNetworkOnly: 0 // TODO use actual value when this is implemented
                });
            });

            scope.options = {
                mobsOnly: self.filterMobsOnly,
                ratings: self.filterRatings
            };

            return $ionicModal.fromTemplateUrl('app/routes/main/nearby/filter-modal/filter-modal.html', {
                scope,
                animation: 'slide-in-right'
            }).then(modal => {
                scope.modal = modal;
                scope.modal.show();

                $scope.$broadcast('nearbyFilterOpened');
            });
        }

        function locationSearch (searchString) {
            LocationService.locationSearch(searchString)
                .then(results => {
                    self.locationResults = results;

                    let namesObj = {};
                    results.forEach((el, idx) => {
                        namesObj['ctx_name_' + (idx + 1)] = el.description;
                    });

                    AnalyticsService.recordEvent("NEARBY", "4.1 - Nearby",
                        namesObj, {
                            "ctx_Map" : $state.current.name.indexOf('map') !== -1 ? 1: 0
                        });
                })
                .catch(err => {
                    self.locationResults = [];
                    console.error(err);
                });
        }

        function selectLocation (placeId) {
            LocationService.getPlaceDetails(placeId)
                .then(place => {
                    self.locationResults = [];
                    self.locationSearchString = place.name;
                    self.filterPlace = place;
                    self.filterPlace.coords = {
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng()
                    };

                    $scope.$broadcast('nearbyLocationChange', self.filterPlace);
                    loadLocations(self.filterPlace.coords);
                })
                .catch(err => {
                    $cordovaDialogs.alert('Unable to load location data.', 'Location Error', 'OK');
                });
        }

        function viewTaps (place) {
            TapDetailsModalService.showTapDetails(place.placeId);
            AnalyticsService.recordEvent("VIEW_LOCATION", "4.3 - Nearby", {
                "ctx_locName": place.title,
                "ctx_locAddress": place.address,
                "ctx_filterCategories": getActiveCategories().join(',') || 'all'
            }, {});
        }

        function getActiveCategories () {
            return self.filterCategories.filter(category => category.active).map(category => category.label);
        }
    }
})();
