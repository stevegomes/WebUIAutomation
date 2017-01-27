(function () {
    'use strict';
    angular.module('ngclamp-js', []).constant('$clamp', clamp_js)
    .directive('ngClamp', function($timeout, $clamp) {
        return {
            link : function(scope, element, attrs) {
                var line = parseInt(attrs.ngClamp) || 2;
                if(attrs.ngBind){
                    scope.$watch(attrs.ngBind, doClamp);
                }
                doClamp();
                function doClamp() {
                    $timeout(function() {
                        clamp_js(element[0], {
                            clamp : line,
                            useNativeClamp: false
                        });
                    }, 0, false);
                }
            }
        };
    });
})();
