(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('IOIService', IOIService);

    IOIService.$inject = ['$q', '$filter', 'moment', 'ApiService', 'LocationService'];

    function IOIService ($q, $filter, moment, ApiService, LocationService) {
        const service = {};

        service.currentIois = [];

        service.getIoisForIds = ids => {
            if (LocationService.hasLocation) {
                let queryParams = {
                    idList: ids || LocationService.locations.map(location => location.place_id)
                };

                return ApiService.request('ioiGet', queryParams, {}, { queryParams });
            } else {
                return $q.reject('Location not available');
            }
        }

        service.prepareIoiList = iois => {
            let locationsList = LocationService.locations.map(loc => {
                iois.forEach(ioi => {
                    if (loc.place_id == ioi.ioiId) {
                        loc.ioi = ioi;
                    }
                });
                return loc;
            });
            return locationsList;
        };

        service.getNearby = (coords, categories) => {
            if (coords) {
                // good to go!
            } else if (LocationService.hasLocation) {
                coords = LocationService.lastKnownLocation.coords;
            } else {
                return $q.reject('Location not available');
            }

            return ApiService.request('ioiRecommendedGet', {
                location: [ coords.latitude, coords.longitude ].join(','),
                categoryList: categories.join(',')
            }).then(response => ({
                boundingBox: response.data.boundingBoxCoordinates,
                categories: response.data.localCategories,
                items: response.data.Items.map(item => {
                    let newItem = {
                        placeId: item.ioiId,
                        ioiId: item.ioiId,
                        title: item.title,
                        address: item.address || '',
                        phone: item.phone || '',
                        loveCount: item.loveCount || 0,
                        okCount: item.okCount || 0,
                        hateCount: item.hateCount || 0,
                        closingTime: item.closingTimes
                            ? (item.closingTimes[moment().day()])
                            : false,
                        distance: LocationService.getDistance(item.geometry.location.lat, item.geometry.location.lng),
                        categories: (item.category || '').split(','),
                        coords: {
                            latitude: item.geometry.location.lat,
                            longitude: item.geometry.location.lng
                        },
                        isMob: item.mobCount > 0
                    };

                    newItem.count = newItem.loveCount + newItem.okCount + newItem.hateCount;

                    let largest = Math.max(newItem.loveCount, newItem.okCount, newItem.hateCount);

                    if (largest === newItem.loveCount) {
                        newItem.rating = 'love';
                    } else if (largest === newItem.okCount) {
                        newItem.rating = 'ok';
                    } else if (largest === newItem.hateCount) {
                        newItem.rating = 'hate';
                    }

                    return newItem;
                })
            }));
        }

        service.getThings = searchString => {
            return getByType('thing', searchString);
        };

        service.getPeople = searchString => {
            return getByType('person', searchString);
        }

        service.addItem = item => {
            /**
             * `item` should look like { "type": "thing", "source": "FTAP", "title": "plane" }
             */

            return ApiService
                .request('ioiPut', null, angular.extend({ source: 'FTAP' }, item))
                .then(response => response.data);
        };

        return service;

        function getByType (type, searchString) {
            searchString = '' + (searchString || ''); // cast to string
            let queryParams = { type, searchString };

            return ApiService
                .request('ioiByTypeGet', queryParams, {}, { queryParams })
                .then(response => {
                    response.data.FilterText = response.data.FilterText || searchString;
                    response.data.Items.forEach(
                        item => item.formattedRatingCount = $filter('shortNumber')(item.totalCount)
                    );

                    return response.data;
                });
        };
    }
})();
