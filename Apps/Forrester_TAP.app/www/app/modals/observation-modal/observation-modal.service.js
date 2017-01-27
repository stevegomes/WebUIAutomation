(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('ObservationModalService', ObservationModalService);

    ObservationModalService.$inject = ['$ionicModal'];

    function ObservationModalService ($ionicModal) {
        const service = {};

        service.item = null;
        service.modal = null;

        /**
         * Initialize the observation to display and show the modal
         */
        service.showModal = item => {
            service.item = item;

            return $ionicModal.fromTemplateUrl('app/modals/observation-modal/observation-modal.html', {
                backdropClickToClose: false
            }).then(modal => {
                service.modal = modal;
                return service.modal.show();
            });
        };

        return service;
    }
})();
