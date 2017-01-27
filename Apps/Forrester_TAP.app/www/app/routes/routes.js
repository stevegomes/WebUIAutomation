(function () {
    'use strict';

    angular
        .module('ftap')
        .config(routes);

    routes.$inject = ['$stateProvider', '$urlRouterProvider', 'FTAP_CONFIG'];

    /**
     * Resolve routes to check whether the user is logged in. This also
     * reauthenticates the user (if possible) to allow them to use any route
     *
     * Users are kicked out of auth routes if they are logged in and kicked
     * out of main routes if they are logged out
     */
    const reauthResolver = {
        isLoggedInFacebook: [
            '$ionicPlatform', 'AuthService', 'FacebookService', 'UserService',
            ($ionicPlatform, AuthService, FacebookService, UserService) => (
                $ionicPlatform.ready().then(() =>
                FacebookService.hasPlugin()
                    ? AuthService.checkFacebookLoginStatus()
                        .then(() => true)
                        .catch(() => false)
                    : false
                )
            )
        ],
        isAnonymous: [
            'AuthService', 'UserService', 'isLoggedInFacebook',
            (AuthService, UserService, isLoggedInFacebook) => (
                isLoggedInFacebook
                    ? false
                    : AuthService.anonymousLogin()
                        .then(() => true)
                        .catch(() => false)
            )
        ]
    };

    function routes ($stateProvider, $urlRouterProvider, FTAP_CONFIG) {
        const USE_CONFIG_A = FTAP_CONFIG.A_OR_B !== 'b';

        $stateProvider
            // onboarding
            .state('onboarding', {
                url: '/onboarding',
                templateUrl: 'app/routes/onboarding/onboarding.html',
                controller: 'OnboardingController',
                controllerAs: 'onboardCtrl',
            })

            // login parent state
            .state('auth', {
                url: '/auth',
                abstract: true,
                params: {
                    reload: null
                },
                templateUrl: 'app/routes/auth/auth.html',
                controller: 'AuthController',
                controllerAs: 'authCtrl',
                resolve: reauthResolver,
            })

                // signup
                .state('auth.signup', {
                    url: '/signup',
                    templateUrl: 'app/routes/auth/signup/signup.html',
                    controller: 'SignupController',
                    controllerAs: 'signupCtrl'
                })

                // signup success
                .state('auth.signup-success', {
                    url: '/success',
                    params: { hasFacebook: null },
                    cache: false,
                    templateUrl: 'app/routes/auth/signup-success/signup-success.html',
                    controller: 'SignupSuccessController',
                    controllerAs: 'successCtrl'
                })

                // login
                .state('auth.login', {
                    url: '/login',
                    templateUrl: 'app/routes/auth/login/login.html',
                    controller: 'LoginController',
                    controllerAs: 'loginCtrl'
                })

            // main parent state
            .state('main', {
                url: '/main',
                abstract: true,
                templateUrl: 'app/routes/main/main.html',
                controller: 'MainController',
                controllerAs: 'mainCtrl',
                resolve: reauthResolver,
            })

                // tap
                .state('main.tap', {
                    url: '/tap',
                    views: {
                        'main-tap': {
                            templateUrl: 'app/routes/main/tap/tap.html',
                            controller: 'TapController',
                            controllerAs: 'tapCtrl'
                        }
                    },
                    native: true,
                    resolve: {
                        native: ['$q', '$ionicPlatform', '$timeout', '$window', 'TapParamsService', function ($q, $ionicPlatform, $timeout, $window, TapParamsService) {
                            var deferred = $q.defer();
                            $ionicPlatform.ready(function () {
                                if (angular.isDefined($window.NativeTap) && !TapParamsService.hasParams()) {
                                    NativeTap.show(function () {
                                        deferred.resolve();
                                    }, null, { reInitialize: false, showCoachMarks: !localStorage.COACH_MARKS_SEEN });
                                } else {
                                    $timeout(function () {
                                        deferred.resolve();
                                    });
                                }
                            });

                            return deferred.promise;
                        }]
                    },
                })

                // nearby
                .state('main.nearby', {
                    url: '/nearby',
                    abstract: true,
                    views: {
                        'main-nearby': {
                            templateUrl: 'app/routes/main/nearby/nearby.html',
                            controller: 'NearbyController',
                            controllerAs: 'nearbyCtrl'
                        }
                    }
                })

                // mobs
                .state('main.mobs', {
                    url: '/mobs',
                    views: {
                        'main-mobs': {
                            templateUrl: 'app/routes/main/mobs/mobs.html',
                            controller: 'MobsController',
                            controllerAs: 'mobsCtrl'
                        }
                    }
                })

                // feed
                .state('main.feed', {
                    url: '/feed',
                    params: { tapCreated: null },
                    views: {
                        'main-feed': {
                            templateUrl: 'app/routes/main/feed/feed.html',
                            controller: 'FeedController',
                            controllerAs: 'feedCtrl'
                        }
                    }
                })

                // profile
                .state('main.profile', {
                    url: '/profile',
                    abstract: true,
                    views: {
                        'main-profile': {
                            templateUrl: 'app/routes/main/profile/profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profileCtrl'
                        }
                    }
                });

        const nearbySubstates = [
            {
                name: 'main.nearby.map',
                config: {
                    url: '/map',
                    templateUrl: 'app/routes/main/nearby/nearby-map/nearby-map.html',
                    controller: 'NearbyMapController',
                    controllerAs: 'mapCtrl'
                },
            },
            {
                name: 'main.nearby.list',
                config: {
                    url: '/list',
                    templateUrl: 'app/routes/main/nearby/nearby-list/nearby-list.html',
                    controller: 'NearbyListController',
                    controllerAs: 'listCtrl'
                },
            },
        ];

        const profileSubstates = [
            {
                name: 'main.profile.my-mobs',
                config: {
                    url: '/my-mobs',
                    templateUrl: 'app/routes/main/profile/my-mobs/my-mobs.html',
                    controller: 'MyMobsController',
                    controllerAs: 'mobsCtrl'
                },
            },
            {
                name: 'main.profile.settings',
                config: {
                    url: '/settings',
                    templateUrl: 'app/routes/main/profile/settings/settings.html',
                    controller: 'SettingsController',
                    controllerAs: 'settingsCtrl'
                },
            },
        ];

        const substatesList = [
            {
                url: '/main/nearby',
                states: nearbySubstates,
            },
            {
                url: '/main/profile',
                states: profileSubstates,
            },
        ];

        // Apply state definitions for all substates. Substate definitions are
        // used below to set the default substate based on previous selection
        // with sub tabs
        substatesList.forEach(substateDefinitionList => {
            // When hitting the abstract state, transition to the last `active`
            // substate. If none, transition to the first substate in the list
            const substateDefinitions = substateDefinitionList.states;
            $urlRouterProvider.when(substateDefinitionList.url, $state => {
                const substates = substateDefinitions.map(state => $state.get(state.name));
                $state.transitionTo(substates.find(state => state.active) || substates[0], {});
            });

            // For each group of substates...
            substateDefinitions.forEach(substateDefinition => {
                // Create the substate for the router
                // Set the substate as `active` when the state is entered. All
                // other substates in this group should be marked inactive
                substateDefinition.config.onEnter = $state => {
                    substateDefinitions.forEach(stateDefinition => $state.get(stateDefinition.name).active = false);
                    $state.get(substateDefinition.name).active = true;
                };

                // Create the state
                $stateProvider.state(substateDefinition.name, substateDefinition.config)
            })
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/auth/signup');
    }
})();
