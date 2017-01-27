(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('TabsService', TabsService);

    TabsService.$inject = [];

    function TabsService () {
        const service = {};

        service.tabsActive = true;

        return service;
    }
})();
