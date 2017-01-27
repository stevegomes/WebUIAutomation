(function () {
    'use strict';

    angular
        .module('ftap')
        .filter('abs', abs);

    abs.$inject = [];

    function abs () {
        return input => Math.abs(input);
    }
})();
