(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('FilterModalController', FilterModalController);

    FilterModalController.$inject = ['$scope', 'AnalyticsService'];

    function FilterModalController ($scope, AnalyticsService) {
        const self = this;

        self.allActive = checkAllActive();
        self.ratings = [ 'love', 'ok', 'hate' ];

        // we want this object to be distinct from nearbyCtrl.filterRatings so that the new filter doesn't take effect
        // until the modal is closed
        $scope.options.ratings = $scope.options.ratings
            ? angular.copy($scope.options.ratings)
            : self.ratings.reduce(
                (status, rating) => {
                    status[rating] = true; // start with all active
                    return status;
                }, {}
            );

        let ratingStatus = $scope.options.ratings;

        self.toggle = toggle;
        self.toggleAll = toggleAll;
        self.toggleRating = toggleRating;
        self.isRatingActive = isRatingActive;

        activate();

        function activate () {
            AnalyticsService.screenView('Nearby Filter');
        }

        function toggle (category) {
            category.active = !category.active;

            self.allActive = checkAllActive();
        }

        function toggleAll () {
            if (!self.allActive) {
                self.allActive = true;
                $scope.nearbyCtrl.filterCategories.forEach(category => category.active = false);
            } else {
                // if `all` is active, then no other categories are selected, so do nothing
            }
        }

        function checkAllActive () {
            return $scope.nearbyCtrl.filterCategories.reduce(
                (result, category) => category.active ? false : result, true
            );
        }

        function toggleRating (rating) {
            ratingStatus[rating] = !ratingStatus[rating];
        }

        function isRatingActive (rating) {
            return ratingStatus[rating];
        }
    }
})();
