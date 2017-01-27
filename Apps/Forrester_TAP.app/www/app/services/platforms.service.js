(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('PlatformService', PlatformService);

    PlatformService.$inject = [];

    function PlatformService () {
        return ionic.Platform;
    }
})();
