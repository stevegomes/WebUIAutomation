(function () {
    'use strict';

    angular
        .module('ftap')
        .directive('ftNavSelector', ftNavSelector);

    function ftNavSelector () {
        return {
            restrict: 'E',
            templateUrl: 'app/directives/nav-selector/nav-selector.html',
            scope: true,
            controller: ['$filter', function ($filter) {
                this.states = [];

                this.selectedClass = () => this.states.map(
                    (state, index) => $filter('isState')(state.name)
                        ? 'ft-nav-selected-' + (index + 1) + ' ft-nav-' + this.states.length + '-items'
                        : ''
                ).join(' ');
            }],
            controllerAs: 'navCtrl',
            link: (scope, element, attrs) => attrs.$observe('states', value => scope.navCtrl.states = scope.$eval(value))
        };
    }
})();
