(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('FacebookService', FacebookService);

    FacebookService.$inject = ['$q', '$window', 'ApiService', 'UserService'];

    function FacebookService ($q, $window, ApiService, UserService) {
        const service = {};

        service.hasPlugin = () => angular.isDefined($window.facebookConnectPlugin);

        service.checkLoginStatus = () => $q(
            (resolve, reject) => {
                if (service.hasPlugin()) {
                    facebookConnectPlugin.getLoginStatus(
                        result => {
                            if (result.status === 'connected') {
                                resolve(result);
                            } else if (result.status === 'not_authorized') {
                                // the user is logged in to Facebook, but has not authenticated
                                reject(result);
                            } else {
                                // the user isn't logged in to Facebook
                                reject(result);
                            }
                        },
                        reject
                    )
                } else {
                    reject();
                }
            }
        );

        service.getFriends = () => $q(
            (resolve, reject) => {
                if (service.hasPlugin()) {
                    // TODO verify that paging works... need a lot of friends for that!
                    const friends = [];
                    const getPage = (url, done) => {
                        facebookConnectPlugin.api(url, [ 'user_friends' ],
                            result => {
                                Array.prototype.push.apply(friends, result.data);

                                if (result && result.paging && result.paging.next) {
                                    getPage(result.paging.next, done);
                                } else {
                                    done(true);
                                }
                            },
                            error => done(false)
                        )
                    };

                    getPage('/me/friends', success => {
                        if (success) {
                            resolve(friends);
                        } else {
                            reject();
                        }
                    });
                } else {
                    reject();
                }
            }
        );

        service.updateFriends = friends =>
            ApiService.request('addfollowersfromsocialPost', {}, {
                Idlist: friends.map(friend => friend.id),
                type: 'facebook'
            })
            .then(response => UserService.friends = response.data.Attributes.friends || []);

        service.getMyInfo = () => $q(
            (resolve, reject) => {
                if (service.hasPlugin()) {
                    facebookConnectPlugin.api('/me?fields=name,email,location,gender,birthday', [ 'email', 'user_location', 'user_birthday' ], resolve, reject);
                } else {
                    reject('Facebook plugin not present');
                }
            }
        );

        return service;
    }
})();
