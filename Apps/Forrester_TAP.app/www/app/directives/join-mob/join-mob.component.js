(function () {
    'use strict';

    angular
        .module('ftap')
        .component('ftJoinMob', {
            templateUrl: 'app/directives/join-mob/join-mob.html',
            bindings: {
                mob: '<'
            },
            controller: ['$cordovaDialogs', 'ObservationService', 'UserService', 'PushNotificationService',
            function ($cordovaDialogs, ObservationService, UserService, PushNotificationService) {
                let cogId = AWS.config.credentials.identityId;
                /**
                 * Join the associated mob if the user is not already a member.
                 * This is done in asynchronously to the user; errors attempt
                 * to roll back incorrectly reflected changes
                 */
                this.joinMob = mob => {
                    if (mob.isMobMember) {
                        return;
                    }

                    ObservationService.join(mob);
                };
            }],
        });
})();
