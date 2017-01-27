(function () {
    'use strict';

    angular
        .module('ftap')
        .component('ftToggle', {
            templateUrl: 'app/directives/toggle/toggle.html',
            bindings: {
                type: '@?',
                value: '='
            }
        });
})();
