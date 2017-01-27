(function () {
    'use strict';

    angular
        .module('ftap')
        .filter('ioisByRating', ioisByRating);

    ioisByRating.$inject = [];

    function ioisByRating () {
        return (items, rating) => {
            let filtered = [];

            if (angular.isArray(items)) {
                items.forEach(item => {
                    if (item.hasOwnProperty(rating + 'Count') && item[rating + 'Count'] > 0) {
                        item.count = item[rating + 'Count'];
                        item.change = item[rating + 'Change'];
                        filtered.push(item);
                    }
                });
            }

            return filtered;
        }
    }
})();
