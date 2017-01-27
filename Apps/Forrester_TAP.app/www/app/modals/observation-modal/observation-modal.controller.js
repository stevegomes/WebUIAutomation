(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('ObservationModalController', ObservationModalController);

    ObservationModalController.$inject = [
        '$cordovaDialogs', 'ObservationService', 'ObservationModalService', 'AnalyticsService'
    ];

    function ObservationModalController ($cordovaDialogs, ObservationService, ObservationModalService, AnalyticsService) {
        const self = this;

        const screenName = 'Post';

        self.closeModal = closeModal;
        self.item = ObservationModalService.item;

        activate();

        function activate () {
            AnalyticsService.screenView(screenName);
            AnalyticsService.recordEvent('VIEWPOST', screenName, {
                ctx_locName: self.item.title,
                ctx_locAddress: self.item.address,
                ctx_sentiment: self.item.rating,
                ctx_postDate: self.item.timestamp
            }, {
                ctx_numJoins: self.item.upvoteCount
            });
        }

        function closeModal () {
            AnalyticsService.recordEvent('CLOSEPOST', screenName, {
                ctx_locName: self.item.title,
                ctx_locAddress: self.item.address,
                ctx_sentiment: self.item.rating,
                ctx_postDate: self.item.timestamp
            }, {
                ctx_numJoins: self.item.upvoteCount
            });

            ObservationModalService.modal.hide()
                .then(() => ObservationModalService.modal.remove())
                .then(() => {
                    self.item = null;
                    ObservationModalService.item = null;
                });
        }
    }
})();
