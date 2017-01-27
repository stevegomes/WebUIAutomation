(function () {
    'use strict';

    angular
        .module('ftap')
        .directive('setMapHeight', function($window, PlatformService) {
            return (scope, element, attrs) => {
                if (PlatformService.isIOS()) {
                    /**
                     * header height: 64px
                     * nearby subheader: 55px
                     * bottom tab bar height: 49px
                     * total deduction: 168px
                     */
                    element.css('height', $window.innerHeight - 168 + 'px');
                }

                if (PlatformService.isAndroid()) {
                    /**
                     * header height: 44px
                     * nearby subheader: 55px
                     * bottom tab bar height: 49px
                     * total deduction: 148px
                     */
                    element.css('height', $window.innerHeight - 148 + 'px');
                }
            }
        })
})();
