(function () {
    'use strict';

    // adapted from http://stackoverflow.com/questions/17547917/angularjs-image-onload-event

    angular
        .module('ftap')
        .directive('onLoad', onLoad);

    onLoad.$inject = ['$parse'];

    function onLoad ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var fn = $parse(attrs.onLoad);

                element.on('load', function (event) {
                    scope.$apply(function () {
                        fn(scope, { $event: event });
                    });
                });
            }
        };
    }
})();
