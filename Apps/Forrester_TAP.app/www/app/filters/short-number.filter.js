(function () {
    'use strict';

    angular
        .module('ftap')
        .filter('shortNumber', shortNumber);

    shortNumber.$inject = ['$window', '$filter'];

    function shortNumber ($window, $filter) {
        return input => input >= 10000
            ? $window.shortNumber(input)
            : $filter('number')(input);
    }
})();
