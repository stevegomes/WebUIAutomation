(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('ImageUriService', ImageUriService);

    ImageUriService.$inject = [];

    function ImageUriService () {
        const service = {};

        service.currentImageUri = null;

        return service;
    }
})();
