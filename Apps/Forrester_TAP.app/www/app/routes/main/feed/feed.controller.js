(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('FeedController', FeedController);

    FeedController.$inject = [
        '$stateParams', '$scope', '$ionicLoading', 'ObservationService', 'ObservationModalService', 'UserService',
        'PushNotificationService', 'AnalyticsService'
    ];

    function FeedController ($stateParams, $scope, $ionicLoading, ObservationService, ObservationModalService,
        UserService, PushNotificationService, AnalyticsService) {
        let self = this;

        self.feedItems = [];
        self.loading = true;
        self.currentFeed = 'mine';
        self.fetchFeedsMine = fetchFeedsMine;
        self.fetchFeedsFriends = fetchFeedsFriends;
        self.showItem = showItem;

        activate();

        function activate() {
            self.fetchFeedsMine();

            if ($stateParams.tapCreated && !PushNotificationService.hasSeenNudge()) {
                PushNotificationService.promptToEnable();
            }
        }

        function fetchFeedsMine () {
            AnalyticsService.screenView('My Feed');
            AnalyticsService.recordEvent("FEED", "9 - Feed", {}, {
                "ctx_Mine": 1,
                "ctx_Friends": 0
            });

            self.feedItems = [];
            self.loading = true;
            self.currentFeed = 'mine';

            $ionicLoading.show()
                .then(() => ObservationService.observationFeed())
                .then(data => self.feedItems = data.data['Items'])
                .catch(err => console.error(JSON.stringify(err)))
                .finally(() => {
                    self.loading = false;
                    $ionicLoading.hide();
                });
        }

        function fetchFeedsFriends () {
            AnalyticsService.screenView('Friends Feed');
            AnalyticsService.recordEvent("FEED", "9 - Feed", {}, {
                "ctx_Mine": 0,
                "ctx_Friends": 1
            });

            self.feedItems = [];
            self.loading = true;
            self.currentFeed = 'friends';

            $ionicLoading.show()
                .then(() => ObservationService.friendFeed(UserService.friends))
                .then(feed => self.feedItems = feed.data)
                .catch(err => console.error(JSON.stringify(err)))
                .finally(() => {
                    self.loading = false;
                    $ionicLoading.hide();
                });
        }

        function showItem (item) {
            $ionicLoading.show()
                .then(() => ObservationService.observationDetails(item.observationId))
                .then(data => {
                    ObservationModalService.showModal(data.data['Items'][0]);
                })
                .catch(err => console.error(err))
                .finally(() => $ionicLoading.hide());
        }
    }
})();
