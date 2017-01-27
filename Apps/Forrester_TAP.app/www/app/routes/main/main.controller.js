(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('MainController', MainController);

    MainController.$inject = [
        '$state', '$scope', '$window', '$timeout', '$ionicPlatform', '$ionicLoading', 'moment', 'LocationService',
        'CameraService', 'FacebookService', 'TabsService', 'ImageUriService', 'IOIService', 'ObservationService',
        'CannedResponseService', 'AnalyticsService', 'SharingService', 'isLoggedInFacebook', 'isAnonymous', 'UserService'
    ];

    function MainController ($state, $scope, $window, $timeout, $ionicPlatform, $ionicLoading, moment, LocationService,
        CameraService, FacebookService, TabsService, ImageUriService, IOIService, ObservationService, CannedResponseService,
        AnalyticsService, SharingService, isLoggedInFacebook, isAnonymous, UserService) {
        var self = this;

        self.TabsService = TabsService;

        activate();

        function activate () {
            updateFriends();

            $ionicPlatform.on('resume', event => {
                updateFriends();
            });
        }

        function updateFriends () {
            FacebookService
                .checkLoginStatus()
                .then(() => FacebookService.getFriends())
                .then(friends => FacebookService.updateFriends(friends))
                .catch(err => console.error(err));
        }

        function sendObservation (observation) {
            $ionicLoading.show()
                .then(() => ObservationService.send(ImageUriService.currentImageUri, observation))
                .then(() => {
                    TabsService.tabsActive = true;
                    ImageUriService.currentImageUri = null;

                    return $state.go('main.feed', { tapCreated: true });
                })
                .catch(err => {
                    console.error(err);
                })
                .then(() => {
                    if (LocationService.hasLocation) {
                        LocationService.fetchLocations(LocationService.lastKnownLocation);
                    }
                })
                .finally(() => $ionicLoading.hide());
        }

        // native handlers are defined here to ensure that the plugin is loaded before they're called
        if (angular.isDefined($window.NativeTap)) {
            NativeTap.tabHandlers(
                () => $scope.$apply(() => TabsService.tabsActive = true),
                () => $scope.$apply(() => TabsService.tabsActive = false)
            );

            // Update NativeTap with information about whether the user is logged
            // into Facebook and if they have selected to share to Facebook
            // by default
            NativeTap.setProfileSettings({
                isLoggedInFacebook,
                isFbSharingEnabledDefault: SharingService.facebook,
            });

            NativeTap.requestLocationsHandler(() => {
                if (LocationService.lastError) {
                    return NativeTap.errorLocations(LocationService.lastError);
                }

                NativeTap.setLocations(LocationService.locations);

                if (!localStorage.COACH_MARKS_SEEN) {
                    localStorage.COACH_MARKS_SEEN = true;
                }
            });

            NativeTap.getPictureHandler(
                () => CameraService.getPicture()
                    .then(nativeUri => {
                        ImageUriService.currentImageUri = nativeUri;
                        NativeTap.setPicture(nativeUri);
                    })
                    .catch(err => console.error(err))
            );

            let getThingsTimeout = null;

            NativeTap.getThingsHandler(
                searchString => {
                    if (getThingsTimeout) {
                        $timeout.cancel(getThingsTimeout);
                    }

                    getThingsTimeout = $timeout(() => {
                        getThingsTimeout = null;

                        IOIService.getThings(searchString)
                            .then(data => {
                                NativeTap.setThings(data)
                                let resultsObj = {};
                                data.Items.forEach((el, idx) => {
                                    resultsObj["ctx_name_" + (idx + 1)] = el["ftap-thing"];
                                });
                                AnalyticsService.recordEvent("SEARCH_TERMS", "3.2 - Search", angular.extend({
                                    "ctx_search": "person",
                                    "ctx_searchTerms": searchString
                                }, resultsObj), {});
                            })
                            .catch(err => {
                                console.error(err);
                                NativeTap.getThingsError(err);
                            });
                    }, 400);
                }
            );

            let getPeopleTimeout = null;

            NativeTap.getPeopleHandler(
                searchString => {
                    if (getPeopleTimeout) {
                        $timeout.cancel(getPeopleTimeout);
                    }

                    getPeopleTimeout = $timeout(() => {
                        getPeopleTimeout = null;

                        IOIService.getPeople(searchString)
                            .then(data => {
                                NativeTap.setPeople(data)
                                let resultsObj = {};
                                data.Items.forEach((el, idx) => {
                                    resultsObj["ctx_name_" + (idx + 1)] = el["ftap-person"];
                                });
                                AnalyticsService.recordEvent("SEARCH_TERMS", "3.2 - Search", angular.extend({
                                    "ctx_search": "person",
                                    "ctx_searchTerms": searchString
                                }, resultsObj), {});
                            })
                            .catch(err => {
                                console.error(err);
                                NativeTap.getPeopleError(err);
                            });
                    }, 400);
                }
            );

            NativeTap.addItemHandler(
                item => IOIService.addItem(item)
                    .then(data => {
                        NativeTap.addItemSuccess(data);
                    })
                    .catch(err => {
                        NativeTap.addItemFailure(err);
                    })
            );

            let locationSearchTimeout = null;

            NativeTap.locationSearchHandler(
                searchString => {
                    searchString = (searchString || '') + ''; // cast to string

                    if (locationSearchTimeout) {
                        $timeout.cancel(locationSearchTimeout);
                    }

                    if (searchString.length < 3) {
                        NativeTap.locationSearchSuccess([]);
                    } else {
                        locationSearchTimeout = $timeout(() => {
                            locationSearchTimeout = null;

                            LocationService.locationSearch(searchString, true)
                                .then(results => {
                                    NativeTap.locationSearchSuccess(results);
                                    let resultsObj = {};
                                    results.forEach((el, idx) => {
                                        resultsObj["ctx_name_" + (idx + 1)] = el.description;
                                    });

                                    AnalyticsService.recordEvent("SEARCH_TERMS", "3.2 - Search", angular.extend({
                                        "ctx_search": "location",
                                        "ctx_searchTerms": searchString
                                    }, resultsObj), {});
                                })
                                .catch(err => {
                                    console.error(err);
                                    NativeTap.locationSearchFailure(err);
                                });
                        }, 400);
                    }
                }
            );

            NativeTap.getLocationRatingResponsesHandler(data => {
                /**
                 *  data = {
                 *      rating: 'love' || 'ok' || 'hate',
                 *      placeType: 'airport' || 'amusement_park' || 'jewelry_store' || ... (from ftap-observation-list.json)
                 *  };
                */

                return CannedResponseService
                    .getResponses(data.ioiId, data.rating)
                    .then(responses => {
                        NativeTap.setLocationRatingResponses(responses);

                        // Aggregate top comments and number of reviews after we receive tap data
                        self.comments = responses.map(el => el.phrase);
                        self.numReviews = responses.reduce((sum, el) => sum += el.count, 0);
                    })
                    .catch(err => console.error(err))
            });

            NativeTap.sendTapHandler(
                data => {
                    /**
                     *  data = {
                     *      selectedState: 'love' || 'ok' || 'hate',
                     *      item: 'title of tapped non-location item',
                     *      location: { location object },
                     *      description: 'description of why item was tapped',
                     *      type: type: 'person' || 'place' || 'thing',
                     *      isFbEnabled: boolean
                     *  };
                     *
                     * N.B. `item` and `location` are mutually exclusive
                     */

                    let commentsObj = {};
                    self.comments.forEach((el, idx) => {
                        commentsObj['ctx_comment_' + (idx + 1)] = el;
                    });

                    UserService[data.selectedState + 'Count'] ++;

                    AnalyticsService.recordEvent("TAP_SUBMIT", "3.4 - Why Did You Tap",
                        angular.extend({
                            "ctx_locName": data.location ? data.location.name : "N/A",
                            "ctx_locAddress": data.location ? data.location.addr : "N/A",
                            "ctx_sentiment": data.selectedState,
                            "ctx_whyTap": data.description,
                            "ctx_shareChannel": "facebook"
                        }, commentsObj), {
                            "ctx_numReviews": self.numReviews,
                            "ctx_attachedPic": ImageUriService.currentImageUri ? 1 : 0
                        });

                    let observation = {
                        rating: data.selectedState,
                        description: data.description,
                        type: data.type,
                        ioiId: data.ioiId
                    };

                    if (data.hasOwnProperty('location')) { // location-based tap
                        observation.place_id = data.location.place_id;
                    } else if (data.hasOwnProperty('item')) { // non-location tap
                        observation.title = data.item;
                    } else { // some sort of invalid tap
                        throw 'Invalid tap data';
                    }

                    sendObservation(observation);
                },
                err => console.error(err)
            );

            NativeTap.recordTapDurationHandler(
                duration => AnalyticsService.recordTap(duration)
            );

            NativeTap.joinMobHandler(
                mobId => ObservationService.join(mobId)
                    .then(() => NativeTap.joinMobSuccess())
                    .catch(err => NativeTap.addItemFailure(err))
            );

            NativeTap.analyticsEventHandler(
                event => AnalyticsService.recordEvent(event.eventType, event.screenName, event.attributes, event.metrics)
            );

             NativeTap.tapMoodHandler(
                mood => {
                    AnalyticsService.recordEvent("TAP", "3.0 - Tap", {
                        "ctx_sentiment": mood,
                        "ctx_locName": "N/A",
                        "ctx_locAddress": "N/A"
                    }, {});
                }
            );

            NativeTap.addItemButtonTappedHandler(
                search => {
                    AnalyticsService.recordEvent("ADD", "3.3.1 - Search", {
                        "ctx_item": search
                    }, {});
                }
            );

            NativeTap.tapSearchHandler(
                category => {
                    AnalyticsService.recordEvent("SEARCH", "3.3 - Search", {
                    "ctx_search": category
                }, {});
                }
            );
        }
    }
})();
