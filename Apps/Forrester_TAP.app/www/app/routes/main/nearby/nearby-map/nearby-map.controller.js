(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('NearbyMapController', NearbyMapController);

    NearbyMapController.$inject = [
        '$state', '$q', '$templateRequest', '$scope', '$compile', '$timeout', '$ionicLoading', 'moment',
        'LocationService', 'IOIService', 'ObservationService', 'AnalyticsService'
    ];

    function NearbyMapController ($state, $q, $templateRequest, $scope, $compile, $timeout, $ionicLoading, moment,
        LocationService, IOIService, ObservationService, AnalyticsService) {
        const self = this;

        const screenName = 'Nearby Map';
        const DEFAULT_ZOOM = 18;
        const MapIcon = L.DivIcon.extend({
            options: {
                className: 'ft-map-icon',
                iconSize: [30, 31],
                iconAnchor: [15, 15.5]
            }
        });
        const loveIcon = new MapIcon({ html: '<img src="app/img/map-pin_love.png">' });
        const okIcon = new MapIcon({ html: '<img src="app/img/map-pin_ok.png">' });
        const hateIcon = new MapIcon({ html: '<img src="app/img/map-pin_hate.png">' });
        const noTapsIcon = new MapIcon({ html: '<img src="app/img/map-pin_no_mobs.png">' });

        let map;
        let locationMarkers = [];
        let currentLocationMarker;
        let currentPosition;
        let boundingBox = null; // the bounding box of the current result set

        self.hasLocation = LocationService.hasLocation;
        self.canRecenter = false;

        self.viewMobs = viewMobs;
        self.centerMap = centerMap;

        $scope.$on('nearbyLoadStart', event => {});

        $scope.$on('nearbyLoadSuccess', (event, items, box) => {
            clearMarkers();
            addMarkers(items);

            boundingBox = new L.LatLngBounds( // `box` looks like [minlat, minlon, maxlat, maxlon]
                new L.LatLng(box[0], box[1]), new L.LatLng(box[2], box[3])
            );
        });

        $scope.$on('nearbyLocationChange', (event, place) => {
            map.setView(new L.LatLng(place.coords.latitude, place.coords.longitude), DEFAULT_ZOOM);
        });

        $scope.$on('nearbyFilterOpened', event => map.closePopup()); // close all popups on filter open to prevent items
                                                                     // removed by filtering from having popups retained
        activate();

        function activate () {
            AnalyticsService.screenView(screenName);

            if (self.hasLocation) {
                let coords = $scope.nearbyCtrl.filterPlace
                    ? $scope.nearbyCtrl.filterPlace.coords
                    : LocationService.lastKnownLocation.coords;

                $timeout(() => { // this section must be wrapped in a timeout for the tile layer to load correctly
                    currentPosition = L.latLng(coords.latitude, coords.longitude);
                    map = L.map('ft-nearby-map').setView(currentPosition, DEFAULT_ZOOM);

                    L.tileLayer('http://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                        subdomains: [0, 1, 2, 3],
                        attribution: '',
                        attributionControl: false,
                        maxZoom: 22,
                        maxNativeZoom: 20,
                        minZoom: 12
                    }).addTo(map);

                    currentLocationMarker = L.marker(currentPosition, {
                        clickable: false,
                        zIndexOffset: 1000
                    });
                    currentLocationMarker.addTo(map);
                }, 0).then(() => {
                    if ($scope.nearbyCtrl.items) {
                        addMarkers($scope.nearbyCtrl.items);
                    }

                    map.on('moveend', () => $timeout(() => {
                        let mapBox = map.getBounds();
                        let mapCenter = map.getCenter();
                        let mapLocations = locationMarkers
                            .filter(marker => mapBox.contains(marker._latlng) && marker.title)
                            .map(marker => marker.title);

                        AnalyticsService.recordEvent('MAP_PANNING', screenName, {
                            ctx_locations: mapLocations.join(', ')
                        }, {
                            ctx_numLocs: mapLocations.length,
                            ctx_centerMapLat: mapCenter.lat,
                            ctx_centerMapLong: mapCenter.lng
                        });

                        if (boundingBox && !boundingBox.contains(mapBox)) {
                            $scope.nearbyCtrl.loadLocations(
                                { latitude: mapCenter.lat, longitude: mapCenter.lng },
                                $scope.nearbyCtrl.getActiveCategories()
                            );
                        }

                        self.canRecenter = !map.getBounds().contains(currentPosition);
                    }));
                });
            }
        }

        function clearMarkers () {
            while (locationMarkers.length) {
                let marker = locationMarkers.pop();
                angular.element(marker._icon).removeClass('ft-visible');

                $timeout(() => {
                    map.removeLayer(marker);
                }, 300);
            }
        }

        function addMarkers (items) {
            $q.all(
                items.map(item => {
                    let icon;

                    if ('love' === item.rating) {
                        icon = loveIcon;
                    } else if ('ok' === item.rating) {
                        icon = okIcon;
                    } else if ('hate' === item.rating) {
                        icon = hateIcon;
                    }

                    return addMarker(item, icon);
                })
            ).then(() => {
                let place = $scope.nearbyCtrl.filterPlace;

                if (place && place.types.indexOf('establishment') !== -1) {
                    let marker = getMarkerByPlaceId(place.place_id);
                    let getCurrentMarker = marker
                        ? $q.resolve(marker)
                        : addMarker({
                            placeId: place.place_id,
                            coords: place.coords,
                            title: place.name,
                            address: place.formatted_address,
                            phone: place.formatted_phone_number,
                            closingTime: place.opening_hours
                                ? LocationService.getClosingTimes(place.opening_hours)[moment().day()]
                                : null,
                            isMob: false
                        }, noTapsIcon);

                    // if our dot overlaps others, we'll zoom in a little bit more
                    getCurrentMarker.then(marker => {
                        let point = map.latLngToLayerPoint(marker._latlng);
                        let minDistance = Math.min.apply(null, locationMarkers.map(
                            otherMarker => otherMarker !== marker
                                ? map.latLngToLayerPoint(otherMarker._latlng).distanceTo(point)
                                : 99999
                        ));

                        if (minDistance < 30) {
                            map.setZoom(DEFAULT_ZOOM + (minDistance < 7 ? 2 : 1));
                        }
                    });
                }
            });
        }

        function addMarker (item, icon) {
            let marker = L.marker([ item.coords.latitude, item.coords.longitude ], { icon });
            marker.placeId = item.placeId;
            marker.title = item.title;

            return createPopup(item).then(popup => {
                marker.bindPopup(popup);
                marker.addTo(map);

                if (item.isMob) {
                    angular.element(marker._icon).addClass('ft-map-icon-mob');
                }

                if (item.rating) {
                    angular.element(marker._icon).addClass('ft-map-icon-' + item.rating);
                }

                locationMarkers.push(marker);

                return $timeout(() => {
                    angular.element(marker._icon).addClass('ft-visible');

                    return marker;
                });
            });
        }

        function createPopup (place) {
            return $templateRequest('app/routes/main/nearby/nearby-map/nearby-popup/nearby-popup.html')
                .then(template => {
                    let scope = $scope.$new();
                    scope.place = place;
                    return $compile(angular.element(template))(scope)[0];
                });
        }

        function getMarkerByPlaceId (placeId) {
            return locationMarkers.reduce(
                (foundMarker, marker) => foundMarker || (marker.placeId === placeId ? marker : null), null
            );
        }

        function viewMobs (place) {
            ObservationService.placeToView = place;
            $state.go('main.mobs');
        }

        function centerMap () {
            if (LocationService.hasLocation) {
                let coords = LocationService.lastKnownLocation.coords;
                currentPosition = L.latLng(coords.latitude, coords.longitude);
            }

            currentLocationMarker.setLatLng(currentPosition);
            map.setView(currentPosition, DEFAULT_ZOOM);
        }
    }
})();
