(function () {
    'use strict';

    angular
        .module('ftap')
        .filter('mob', mob);

    mob.$inject = [];

    function mob () {
        return (items, isActive) => isActive
            ? items.filter(item => item.isMob)
            : items;
    }
})();
