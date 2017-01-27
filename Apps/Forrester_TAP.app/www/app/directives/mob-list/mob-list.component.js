(function () {
    'use strict';

    angular
        .module('ftap')
        .component('ftMobList', {
            templateUrl: 'app/directives/mob-list/mob-list.html',
            bindings: {
                mobs: '<'
            },
            controller: ['ObservationModalService',
                function (ObservationModalService) {
                    this.openMovement = mob => {
                        ObservationModalService.showModal(mob)
                            .catch(err => console.error(err));
                    }
                }
            ],
        });
})();
