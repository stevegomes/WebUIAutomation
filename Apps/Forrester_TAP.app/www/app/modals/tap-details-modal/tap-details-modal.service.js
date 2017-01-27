(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('TapDetailsModalService', TapDetailsModalService);

    TapDetailsModalService.$inject = ['$ionicModal'];

    function TapDetailsModalService ($ionicModal) {
        const service = {};

        service.placeId = null;
        service.mob = null;
        service.modal = null;
        service.category = null;

        service.showTapDetails = (placeId, rating) => {
            service.placeId = placeId;
            service.category = "places";
            service.mob = null;

            return showModal();
        };

        service.showMobDetails = (mob, category) => {
            if (!mob.place_id) {
                mob.place_id = null;
            }

            service.category = category;
            service.mob = mob;

            return showModal();
        };

        return service;

        function showModal () {
            return $ionicModal.fromTemplateUrl('app/modals/tap-details-modal/tap-details-modal.html', {
                backdropClickToClose: false,
                animation: 'slide-in-left'
            }).then(modal => {
                service.modal = modal;

                return service.modal.show();
            });
        }
    }
})();
