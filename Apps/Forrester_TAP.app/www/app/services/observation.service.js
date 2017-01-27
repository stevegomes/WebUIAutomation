(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('ObservationService', ObservationService);

    ObservationService.$inject = [
        '$q', '$window', '$cordovaDialogs', 'CameraService', 'ApiService', 'S3Service', 'UserService',
        'LocationService', 'PushNotificationService'
    ];

    function ObservationService ($q, $window, $cordovaDialogs, CameraService, ApiService, S3Service, UserService,
        LocationService, PushNotificationService) {
        const service = {};

        service.placeToView = null;

        service.send = (imageUri, observation) => $q.when()
            .then(() => {
                if (observation.hasOwnProperty('place_id')) {
                    observation.type = 'place';
                }

                if (UserService.username) {
                    observation.username = UserService.username;
                }

                if (UserService.name) {
                    observation.name = UserService.name;
                }

                if (UserService.thumbnailLink) {
                    observation.photoLink = UserService.thumbnailLink;
                } else if (UserService.photoLink) {
                    observation.photoLink = UserService.photoLink;
                }

                return observation.place_id
                    ? LocationService.getPlaceDetails(observation.place_id)
                    : $q.when(false);
            })
            .then(place => {
                if (place) {
                    observation.geometry = place.geometry;
                    observation.title = place.name;
                    observation.category = place.types.join(',');

                    if (place.formatted_address) {
                        observation.address = place.formatted_address;
                    }

                    if (place.formatted_phone_number) {
                        observation.phone = place.formatted_phone_number;
                    }

                    if (place.opening_hours) {
                        observation.closingTimes = LocationService.getClosingTimes(place.opening_hours);
                    }
                }

                if (observation.title.length > 40) {
                    observation.title = observation.title.substring(0, 37) + "...";
                }
            })
            .then(() => imageUri
                ? CameraService.crop(imageUri, 1080, 1080, true)
                    .then(blob => S3Service.uploadPhoto(blob))
                    .then(result => result.Location)
                : false
            )
            .then(imageUrl => {
                let queryParams = { feedType: 'Obs' };

                if (imageUrl) {
                    observation.imageUrl = imageUrl;
                }

                return ApiService.request('observationPut', queryParams, observation, { queryParams });
            })
            .then(response => {
                if (angular.isDefined('NativeTap')) {
                    NativeTap.sendTapSuccess();
                }

                return response;
            })
            .catch(err => {
                if (angular.isDefined('NativeTap')) {
                    NativeTap.sendTapFailure();
                }

                return $q.reject(err);
            })

        service.observationFeed = () => {
            let queryParams = { movementFeed: '' };

            return ApiService.request('observationfeedGet', queryParams, {}, { queryParams })
        };

        service.upvotedObservationFeed = () => {
            let queryParams = { movementFeed: '1' };

            return ApiService.request('observationfeedGet', queryParams, {}, { queryParams })
        };

        service.friendFeed = (friends) => {
            let cogIds = friends.map(el => el.cogId).join();
            let queryParams = {
                idList: cogIds,
                onLocation: '',
                mobsOnly: ''
            };

            return ApiService.request('feedGet', queryParams, {}, { queryParams });
        };

        service.observationDetails = observationId => {
            return ApiService.request('observationGet', {
                observationId
            }, {}, { queryParams: { observationId } });
        };

        service.join = mob => {
            let queryParams = { feedType: 'Agr' };
            let cogId = AWS.config.credentials.identityId;

            if (typeof mob === 'string') {
                mob = {
                    upvoteCount: 0,
                    isMobMember: false,
                    mobId: mob
                };
            }

            mob.upvoteCount++;
            mob.isMobMember = true;

            return ApiService.request('observationPut', queryParams, { upvotedMobId: mob.mobId }, { queryParams })
                .then(() => {
                    if (!PushNotificationService.hasSeenNudge()) {
                        PushNotificationService.promptToEnable();
                    } else {
                        PushNotificationService.checkIfEnabled()
                            .then(() => { /* user has notifications enabled, no action required */ })
                            .catch(err => {
                                if (!localStorage.PUSH_NOTIFICATION_REMINDER_SEEN) {
                                    $cordovaDialogs.alert(
                                        "If you would like to receive notifications regarding this Mob and others "
                                      + "you've joined, please turn them on in your application settings.", '', 'OK');
                                    localStorage.PUSH_NOTIFICATION_REMINDER_SEEN = true;
                                }
                            });
                    }
                }).catch(err => {
                    $cordovaDialogs.alert("We're sorry, an error occurred when you tried to join this Mob.", '', 'OK');
                    mob.upvoteCount--;
                    mob.isMobMember = false;

                    return $q.reject(err);
                });
        };

        service.getTapsForLocation = placeId => {
            let queryParams = {
                idList: placeId,
                onLocation: 1,
                mobsOnly: ''
            };

            return ApiService.request('feedGet', queryParams, {}, { queryParams })
                .then(response => response.data);
        };

        service.getMobsForLocation = placeId => {
            let queryParams = {
                idList: placeId,
                onLocation: 1,
                mobsOnly: 1
            };

            return ApiService.request('feedGet', queryParams, {}, { queryParams })
                .then(response => response.data);
        };

        service.getRelatedTaps = combinedDescription => {
            let queryParams = { combinedDescription };

            return ApiService.request('feedByMobGet', queryParams, {}, { queryParams })
                .then(response => response.data.Items);
        };

        service.getMobs = (type, coords) => {
            let queryParams = {
                type,
                location: (coords ? [coords.latitude, coords.longitude] : []).join(',')
            };

            return ApiService.request('feedByTypeGet', queryParams, {}, { queryParams })
                .then(response => {
                    if (LocationService.hasLocation) {
                        response.data.forEach(item => {
                            if (item.geometry) {
                                item.distance = LocationService.getDistance(
                                    item.geometry.location.lat, item.geometry.location.lng
                                );
                            }
                        });
                    }

                    return response.data;
                });
        }

        service.searchMobs = (type, searchString) => {
            let queryParams = { type, searchString };

            return ApiService.request('feedSearchGet', queryParams, {}, { queryParams })
                .then(response => {
                    let results = response.data.Items;

                    if (LocationService.hasLocation) {
                        results.forEach(item => {
                            if (item.geometry) {
                                item.distance = LocationService.getDistance(
                                    item.geometry.location.lat, item.geometry.location.lng
                                );
                            }
                        });
                    }

                    return results;
                });
        };

        return service;
    }
})();
