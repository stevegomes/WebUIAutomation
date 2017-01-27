(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('UserService', UserService);

    UserService.$inject = ['ApiService'];

    function UserService (ApiService) {
        const service = {
            cogId: null,
            socialId: null,
            username: null,
            name: null,
            email: null,
            location: null,
            photoLink: null,
            thumbnailLink: null,
            gender: null,
            birthYear: null,
            loveCount: 0,
            hateCount: 0,
            okCount: 0,
            notifs: 0,
            timestamp: null,
            // List of IDs for friends/followers
            friends: [],
        };

        service.registerUser = (socialId, email, photoLink, username) => {
            const userInfo = {};

            if (socialId) {
                userInfo.socialId = socialId;
            }

            if (email) {
                userInfo.email = email;
            }

            if (photoLink) {
                userInfo.photoLink = photoLink;
            }

            if (username) {
                userInfo.username = username;
            }

            if (!username && !socialId) {
                userInfo.status = 'anonymous';
            } else {
                userInfo.status = 'facebook';
            }

            return ApiService.request('registeruserPost', {}, userInfo)
                .then(response => {
                    // Set user default data post-login
                    // cognito ID is used as user identifier and friends
                    // list is used to generate feeds
                    service.cogId = AWS.config.credentials.identityId;
                    service.friends = response.data.friends || [];
                    service.photoLink = response.data.photoLink;
                    service.thumbnailLink = service.photoLink
                        ? service.photoLink.replace('/profile/profile.png', '/profile-thumbnail/profile-resized.png')
                        : '';
                    service.timestamp = response.data.timestamp.split("T")[0];

                    // Update counts on load and after tap, for analytics
                    service.loveCount = response.data.loveCount;
                    service.hateCount = response.data.hateCount;
                    service.okCount = response.data.okCount;

                    return response;
                });
        }

        service.updateSocialId = (photoLink) => {
            ApiService.request('linkaccountsPost', {}, {
                email: service.email,
                location: service.location,
                name: service.name,
                photoLink: photoLink,
                socialid: service.socialId,
                status: 'facebook'
            });
        }

        return service;
    }
})();
