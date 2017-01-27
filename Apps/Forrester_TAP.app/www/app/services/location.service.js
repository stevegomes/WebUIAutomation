/**
 * Fetch and record locations for Google Places API
 */
(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('LocationService', LocationService);

    LocationService.$inject = [
        '$http', '$q', '$timeout', '$window', '$interval', '$cordovaGeolocation', '$injector', '$filter', 'moment',
        'lodash', 'FTAP_CONFIG', 'AnalyticsService'
    ];

    function LocationService ($http, $q, $timeout, $window, $interval, $cordovaGeolocation, $injector, $filter, moment,
        lodash, FTAP_CONFIG, AnalyticsService) {
        const service = {};
        // Location list acquired from Google Places
        service.locations = [];
        // Keep track of last error when trying to retrieve location list
        service.lastError = null;
        // Used for throttling watchPosition updates
        service.lastWatchChange = 0;
        // Keep track of user's last known location
        service.lastKnownLocation = false;
        // place types to get from Google places
        // This is the default list, but an updated list is acquired from
        // S3 upon initialization
        service.placeTypes = [
            "airport",
            "amusement_park",
            "aquarium",
            "bakery",
            "bar",
            "cafe",
            "car_rental",
            "clothing_store",
            "department_store",
            "florist",
            "food",
            "grocery_or_supermarket",
            "gym",
            "hair_care",
            "home_goods_store",
            "jewelry_store",
            "movie_theater",
            "night_club",
            "restaurant",
            "shopping_mall",
            "spa",
            "stadium",
            "store",
            "train_station",
            "zoo",
        ];

        /**
         * Transforms array of business opening hours into an array of closing times for use in map popups. Example:
         *
         * Input:
         *
         * {
         *     "open_now": true,
         *     "periods": [
         *         { "close": { "day": 0, "time": "1700" }, "open": { "day": 0, "time": "1000" } },
         *         { "close": { "day": 1, "time": "2200" }, "open": { "day": 1, "time": "0800" } },
         *         { "close": { "day": 2, "time": "2200" }, "open": { "day": 2, "time": "0800" } },
         *         { "close": { "day": 3, "time": "2200" }, "open": { "day": 3, "time": "0800" } },
         *         { "close": { "day": 5, "time": "0200" }, "open": { "day": 4, "time": "0800" } },
         *         { "close": { "day": 6, "time": "0200" }, "open": { "day": 5, "time": "0800" } },
         *         { "close": { "day": 0, "time": "0200" }, "open": { "day": 6, "time": "0800" } }
         *     ],
         *     "weekday_text": [ "Monday: 8:00 AM – 10:00 PM", "Tuesday: 8:00 AM – 10:00 PM", ... ]
         * }
         *
         * Output:
         *
         * { 0: "5:00 PM", 1: "10:00 PM", 2: "10:00 PM", 3: "10:00 PM", 4: "2:00 AM", 5: "2:00 AM", 6: "2:00 AM" }
         *
         * N.B. If a place is open 24 hours, the `periods` will look like so:
         *
         * "periods" : [
         *     { "open" : { "day" : 0, "time" : "0000" } }
         * ]
         */

        service.getClosingTimes = openingHours => {
            if (openingHours.periods.length === 1 && openingHours.periods[0].open && !openingHours.periods[0].close) {
                return lodash.range(0, 7).reduce(
                    (times, day) => {
                        times[day] = '24 hours';
                        return times;
                    }, {}
                );
            }

            return openingHours.periods.reduce(
                (times, period) => {
                    let time = moment(period.close.time, 'HHmm');

                    if (time.isValid()) {
                        times[period.open.day] = time.format('h:mm A'); // use the day from the opening time to handle
                    }                                                   // cases where closing time is the next day

                    return times;
                }, {}
            );
        };

        service.locationSearch = (searchString, onlyEstablishments) => $q(
            (resolve, reject) => {
                searchString = '' + (searchString || ''); // cast to string

                if (searchString.length < 3) {
                    resolve([]);
                }

                let autocomplete = new $window.google.maps.places.AutocompleteService();
                let request = { input: searchString };

                if (onlyEstablishments) {
                    request.types = [ 'establishment' ];
                }

                if (service.hasLocation) {
                    request.radius = 40234; // in meters (40234 m ~= 25 mi) -- required when using `location`
                    request.location = new $window.google.maps.LatLng(
                        service.lastKnownLocation.coords.latitude, service.lastKnownLocation.coords.longitude
                    );
                }

                autocomplete.getPlacePredictions(request, (results, status) => {
                    if (status != google.maps.places.PlacesServiceStatus.OK) {
                        console.error('Google Maps error: ' + status);
                        console.error(results);

                        return reject(results);
                    }

                    console.log(results);
                    resolve(results);
                });
            }
        );

        service.hasLocation = false;

        service.watchId = false;

        service.getCoordinates = searchString => $q((resolve, reject) => {
            const maps = $window.google.maps;
            const geocoder = new maps.Geocoder;

            geocoder.geocode({
                address: searchString
            }, (result, status) => {
                console.log(result);

                if (status === maps.GeocoderStatus.OK) {
                    resolve({
                        latitude: result[0].geometry.location.lat(),
                        longitude: result[0].geometry.location.lng()
                    });
                } else {
                    reject(result);
                }
            });
        });

        /**
         * Retrieve place name from Google Places API based on lat/lng coords
         */
        service.getPlaceName = coords => $q((resolve, reject) => {
            const maps = $window.google.maps;
            const geocoder = new maps.Geocoder;

            geocoder.geocode({
                location: coords
            }, (result, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    // https://developers.google.com/maps/documentation/geocoding/intro#GeocodingResponses
                    let city, state, country;
                    let components = result[0].address_components; // assume the first result is most accurate

                    for (let i = 0; i < components.length; i++) {
                        let types = components[i].types;

                        for (let j = 0; j < types.length; j++) {
                            if (types[j] === 'country') {
                                country = components[i].short_name;
                            } else if (types[j] === 'administrative_area_level_1') { // state (US)
                                state = components[i].short_name;
                            } else if (types[j] === 'locality') { // city/town (US)
                                city = components[i].long_name;
                            }
                        }
                    }

                    let pieces = [];

                    if (city) {
                        pieces.push(city);
                    }

                    if (state) {
                        pieces.push(state);
                    }

                    if (country) {
                        pieces.push(country);
                    }

                    resolve(pieces.join(', '));
                } else {
                    reject(result);
                }
            });
        });

        /**
         * Retrieve locations from Google Places API and update service's
         * location list
         */
        service.fetchLocations = position => {
            const maps = $window.google.maps;

            new maps.places.PlacesService(document.createElement('div')).nearbySearch({
                location: new maps.LatLng(position.coords.latitude, position.coords.longitude),
                rankBy: maps.places.RankBy.DISTANCE,
                types: service.placeTypes,
            }, (results, status) => {
                if (status === maps.places.PlacesServiceStatus.OK) {
                    // Remove any locality/political locations
                    let locations = results.filter(location =>
                        -1 === location.types.indexOf('locality')
                         && -1 === location.types.indexOf('political')
                    ).map(location => ({
                        place_id: location.place_id,
                        name: location.name,
                        geometry: location.geometry,
                        addr: location.vicinity,
                        distance: service.getDistance(location.geometry.location.lat(), location.geometry.location.lng()),
                        type: location.types[0],
                        types: location.types.filter(
                            type => type !== 'establishment' && type !== 'point_of_interest'
                        )
                    }));

                    let IOIService = $injector.get('IOIService');

                    IOIService.getIoisForIds(locations.map(location => location.place_id))
                        .then(response => {
                            let iois = response.data.reduce((iois, ioi) => {
                                iois[ioi.ioiId] = ioi;
                                return iois;
                            }, {});

                            locations.forEach(location => {
                                if (iois.hasOwnProperty(location.place_id)) {
                                    let ioi = iois[location.place_id];
                                    let largest = Math.max(ioi.loveCount, ioi.okCount, ioi.hateCount);

                                    location.ioiId = ioi.ioiId;

                                    if (largest === ioi.loveCount) {
                                        location.ratingType = 'love';
                                    } else if (largest === ioi.okCount) {
                                        location.ratingType = 'ok';
                                    } else if (largest === ioi.hateCount) {
                                        location.ratingType = 'hate';
                                    }

                                    location.ratingCount = ioi.loveCount + ioi.okCount + ioi.hateCount;
                                } else {
                                    location.ratingType = '';
                                    location.ratingCount = 0;
                                }

                                location.formattedRatingCount = $filter('shortNumber')(location.ratingCount);
                            });

                            service.lastError = null;
                            service.locations = locations;

                            // Send new locations to native plugin
                            if (angular.isDefined($window.NativeTap)) {
                                NativeTap.setLocations(service.locations);
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            service.lastError = err;
                        })
                }
                // Handle error on position change and clear locations
                else {
                    console.error("Error retrieving places from Google");
                    console.error(status);
                    console.error(results);
                    service.locations = [];
                    service.lastError = results;
                }
            });
        };

        service.init = () => {
            if (service.watchId) {
                $cordovaGeolocation.clearWatch(service.watchId);
                service.watchId = false;
            }

            service.watchId = $cordovaGeolocation.watchPosition({ enableHighAccuracy: false });

            service.watchId.then(null, err => {
                console.error("Error watching position change");
                console.error(JSON.stringify(err));

                service.locations = [];
                service.lastError = err;
                service.lastKnownLocation = false;
                service.lastWatchChange = 0;
                service.hasLocation = false;
            }, position => {
                const now = new Date;
                // Do not update location list if the position has changed
                // after less than a minute
                if (now - service.lastWatchChange > 60000) {
                    service.lastKnownLocation = position;
                    service.lastWatchChange = now;
                    service.hasLocation = true;

                    if (!localStorage.ANALYTICS_ENABLE_LOCATION_SENT) {
                        localStorage.ANALYTICS_ENABLE_LOCATION_SENT = 'true';
                        AnalyticsService.recordEvent('ENABLE_LOCATION', 'Enable Location');
                    }

                    return service.fetchLocations(position);
                }
            });

            service.fetchPlaceTypes();
        };

        service.startUp = () => {
            // Wait for google API to become available
            const checkGoogleAvailability = $interval(() => {
                if (angular.isDefined($window.google)) {
                    $interval.cancel(checkGoogleAvailability);

                    service.init();
                }
            }, 1000);
        };

        service.getPlaceDetails = placeId => $q(
            (resolve, reject) => {
                const maps = $window.google.maps;

                new maps.places.PlacesService(document.createElement('div')).getDetails({ placeId },
                    (place, status) => {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            resolve(place);
                        } else {
                            console.error('Google Maps error: ' + status);
                            console.error(place);

                            reject(place);
                        }
                    }
                );
            }
        );

        service.fetchPlaceTypes = () => $http.get(`https://s3.amazonaws.com/${FTAP_CONFIG.S3_RESOURCE_BUCKET}/place-types.json`)
            .then(response => service.placeTypes = response.data);

        /**
         * Get the distance between a lat/long point and the user's last known location.  Returns distance in feet if
         * distance < 0.1 mi or miles if >= 0.1 mi.  Returns null on error (most likely no last known location)
         */
        service.getDistance = (lat, lng) => {
            try {
                let distance = geolib.getDistance(service.lastKnownLocation.coords, { latitude: lat, longitude: lng });

                return geolib.convertUnit('mi', distance) >= 0.1
                    ? `${geolib.convertUnit('mi', distance, 1)} mi`
                    : `${geolib.convertUnit('ft', distance, 0)} ft`;
            } catch (e) {
                console.error(e);
                return null;
            }
        };

        return service;
    }
})();
