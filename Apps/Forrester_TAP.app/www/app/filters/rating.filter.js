(function () {
    'use strict';

    angular
        .module('ftap')
        .filter('rating', rating);

    rating.$inject = [];

    function rating () {
        /**
         * `options` will look like { love: true, ok: true, hate: false }
         */
        return (items, options) => options
            ? items.filter(
                item => Object.keys(options).filter(key => options[key]).indexOf(item.rating) !== -1
            )
            : items;
    }
})();
