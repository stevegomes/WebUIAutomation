(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('SharingService', SharingService);

    SharingService.$inject = ['$window'];

    function SharingService ($window) {
        const service = {
            get facebook () {
                return localStorage.getItem('FTAP_SHARE_FACEBOOK') === 'true';
            },

            set facebook (value) {
                localStorage.setItem('FTAP_SHARE_FACEBOOK', !!value);

                // Update NativeTap with default sharing selection
                if ($window.NativeTap) {
                    NativeTap.setProfileSettings({
                        isFbSharingEnabledDefault: !!value,
                    });
                }
            }
        };

        // set default value if localStorage key doesn't yet exist
        if (localStorage.getItem('FTAP_SHARE_FACEBOOK') === null) {
            localStorage.setItem('FTAP_SHARE_FACEBOOK', false);
        }

        return service;
    }
})();
