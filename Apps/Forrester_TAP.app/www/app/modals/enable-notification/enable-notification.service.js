(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('EnableNotificationModalService', EnableNotificationModalService);

    EnableNotificationModalService.$inject = ['$q', '$rootScope', '$ionicModal', 'AnalyticsService'];

    function EnableNotificationModalService ($q, $rootScope, $ionicModal, AnalyticsService) {
        const service = {};

        service.showModal = () => $q(
            (resolve, reject) => {
                let scope = $rootScope.$new();

                scope.close = () => scope && scope.modal
                    ? scope.modal.hide().then(() => scope.modal.remove())
                    : $q.when();

                scope.confirm = () => scope.close().then(resolve);

                scope.cancel = () => scope.close().then(reject);

                scope.$on('$destroy', () => {
                    scope && scope.modal && scope.modal.remove();
                });

                $ionicModal.fromTemplateUrl('app/modals/enable-notification/enable-notification.html', {
                    scope,
                    backdropClickToClose: false
                }).then(modal => {
                    scope.modal = modal;
                    scope.modal.show();

                    AnalyticsService.screenView('Enable Notification');
                });
            }
        );

        return service;
    }
})();
