(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('MobsController', MobsController);

    MobsController.$inject = [
        '$state', '$timeout', '$ionicLoading', '$ionicScrollDelegate', 'lodash', 'ObservationService',
        'LocationService', 'ObservationModalService', 'TapDetailsModalService', 'AnalyticsService'
    ];

    function MobsController ($state, $timeout, $ionicLoading, $ionicScrollDelegate, lodash, ObservationService,
        LocationService, ObservationModalService, TapDetailsModalService, AnalyticsService) {
        var self = this;
        var resultsObj = {people: {}, places: {}, things: {}};

        const items = { people: null, places: null, things: null };
        const searchStringCache = { people: '', places: '', things: '' };

        let isJoiningMob = false;

        self.categories = [ 'people', 'places', 'things' ];
        self.selectedCategory = null;
        self.displayItems = null;
        self.searchString = null;
        self.lastSearchedString = null;
        self.loaded = false;

        self.getSelectedCategoryClass = getSelectedCategoryClass;
        self.selectCategory = selectCategory;
        self.searchMobs = searchMobs;
        self.showMobDetails = showMobDetails;
        self.joinMob = joinMob;

        activate();

        function activate () {
            AnalyticsService.screenView('Mobs');

            if (ObservationService.placeToView) {
                let place = ObservationService.placeToView;
                ObservationService.placeToView = null;

                items.places = []; // `selectCategory` will not load the default list if this already exists
                selectCategory('places');
                self.searchString = place.title;

                $ionicLoading.show()
                    .then(() => retrievePlaceMobs(place))
                    .finally(() => {
                        self.loaded = true;
                        $ionicLoading.hide();
                    });
            } else {
                selectCategory($state.$current.selected || 'places');
            }
        }

        function getSelectedCategoryClass () {
            let index = self.categories.indexOf(self.selectedCategory);

            return index !== -1
                ? 'ft-nav-selected-' + (index + 1)
                : false;
        }

        function selectCategory (category) {
            // Will add results object if it exists, otherwise will just send ctx_search
            AnalyticsService.recordEvent("MOBS", "4.5 - Mob", angular.extend({
                "ctx_search": category
            }, resultsObj[category]), {});

            if (self.selectedCategory !== category) {
                if (searchStringCache.hasOwnProperty(self.selectedCategory)) {
                    searchStringCache[self.selectedCategory] = self.searchString;
                }

                self.selectedCategory = category;
                self.displayItems = items[category];
                self.searchString = searchStringCache[category];
                $state.$current.selected = category;
                $ionicScrollDelegate.$getByHandle('list').scrollTop(false);

                $timeout(() => self.lastSearchedString = self.searchString); // wrapped in $timeout to prevent flicker

                if (!self.displayItems) {
                    $ionicLoading.show()
                        .then(() => retrieveDefaultMobs(category))
                        .finally(() => {
                            self.loaded = true;
                            $ionicLoading.hide();
                        });
                }
            }
        }

        function searchMobs (category, searchString) {
            let type = getTypeFromCategory(category);

            searchString = (searchString || '') + ''; // ensure stringiness

            if (searchString.length < 3) {
                return retrieveDefaultMobs(category);
            } else {
                return ObservationService.searchMobs(type, searchString)
                    .then(results => {
                        setDisplayItems(category, results, searchString);

                        // Clear results object by category
                        resultsObj[category] = {};
                        results.forEach((el, idx) => {
                            resultsObj[category]["ctx_score_" + (idx + 1)] = el.upvoteCount;
                            resultsObj[category]["ctx_name_" + (idx + 1)] = el.title;
                            resultsObj[category]["ctx_review_text_" + (idx + 1)] = el.description;
                            resultsObj[category]["ctx_distance_" + (idx + 1)] = el.distance || "N/A";
                        });

                        AnalyticsService.recordEvent("MOBS", "4.5 - Mob", angular.extend({
                            "ctx_search": category,
                        }, resultsObj[category]), {});
                    })
                    .catch(err => console.error(err));
            }
        }

        function showMobDetails (mob) {
            TapDetailsModalService.showMobDetails(mob, self.selectedCategory);
        }

        function joinMob (mob) {
            if (!isJoiningMob && !mob.isMobMember) {
                isJoiningMob = true;

                ObservationService.join(mob).finally(() => isJoiningMob = false);
            }
        }

        function getTypeFromCategory (category) {
            if (category === 'people') {
                return 'person';
            } else if (category === 'places') {
                return 'place';
            } else if (category === 'things') {
                return 'thing';
            }

            return null;
        }

        function setDisplayItems (category, displayItems, searchString) {
            if (searchString) {
                self.lastSearchedString = searchString;
            }

            return $timeout(() => { // wrapped in $timeout to prevent flicker
                if (!items[category]) {
                    items[category] = [];
                }

                angular.copy(displayItems, items[category]);

                if (!self.displayItems) {
                    self.displayItems = items[category];
                }

                return self.displayItems;
            });
        }

        function retrieveDefaultMobs (category) {
            let type = getTypeFromCategory(category);
            let coords = LocationService.hasLocation ? LocationService.lastKnownLocation.coords : null;

            return ObservationService.getMobs(type, coords)
                .then(results => setDisplayItems(category, results))
                .catch(err => console.error(err));
        }

        function retrievePlaceMobs (place) {
            return ObservationService.getMobsForLocation(place.placeId)
                .then(items => items.filter(item => item.upvoteCount)) // only want movements with upvotes
                .then(results => setDisplayItems('places', results, place.title))
                .catch(err => console.error(err));
        }
    }
})();
