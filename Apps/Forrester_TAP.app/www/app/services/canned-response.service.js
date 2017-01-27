/**
 * Fetch and assign sample responses from API
 */
(function() {
    'use strict';

    angular
        .module('ftap')
        .factory('CannedResponseService', CannedResponseService)

    CannedResponseService.$inject = ['$http', '$q', '$filter', 'FTAP_CONFIG', 'ApiService']

    function CannedResponseService ($http, $q, $filter, FTAP_CONFIG, ApiService) {
        const service = {};

        service.defaultResponses = { // fallback
            'love': [
                'One of my favorites',
                'Absolutely fantastic!',
                'Highly recommended',
                'Better than the others'
            ],

            'ok': [
                'Just alright',
                'Neither good nor bad',
                'Not the greatest',
                'Could take it or leave it'
            ],

            'hate': [
                'Terrible, just terrible',
                'Avoid if you can',
                'Would not recommend at all',
                'No thanks'
            ]
        };

        service.getResponses = (ioiId, rating) => {
            if (Object.keys(service.defaultResponses).indexOf(rating) === -1) {
                return $q.reject('Please provide a valid rating ("love"/"ok"/"hate")');
            }

            let queryParams = { ioiId, rating };

            return ApiService.request('observationOtherResponsesGet', queryParams, {}, { queryParams })
                .then(response => response.data.data)
                .catch(err => service.defaultResponses[rating].map(phrase => ({ phrase, count: 0 })))
                .then(responses => responses.map(
                    response => ({
                        phrase: response.phrase,
                        count: response.count,
                        formattedCount: $filter('shortNumber')(response.count),
                        formattedCountPlusOne: $filter('shortNumber')(response.count + 1),
                        isMob: !!response.isMob,
                        mobId: response.mobId || '',
                        isMobMember: !!response.isMobMember
                    })
                ));
        }

        return service;
    }

})();
