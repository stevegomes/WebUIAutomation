(function () {
    'use strict';

    angular
        .module('ftap')
        .filter('underscoreToSpace', underscoreToSpace);

    underscoreToSpace.$inject = [];

    function underscoreToSpace () {
        return input => {
            input = input + ''; // cast to string
            return input.replace(/_/g, ' ');
        };
    }
})();
