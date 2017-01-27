(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('TapParamsService', TapParamsService);

    TapParamsService.$inject = [];

    /**
     * because of the way Ionic and ui-router handle sub-states (and all states are substates of 'main')
     * state params are never cleared once set
     * therefore, after the first time user goes to the tap screen from Location details
     * all consecutive entries to the tap screen bring up the same location
     * a way around it is to use a service to pass the rating and place id
     * instead of state params.
     */
    function TapParamsService () {
        const service = {};

        service.rating = false;
        service.place_id = false;
        service.hasParams = () => service.rating && service.place_id;

        return service;
    }
})();
