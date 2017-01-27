

(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('ProfilePictureService', ProfilePictureService);

    ProfilePictureService.$inject = ['CameraService', 'S3Service', 'UserService', 'ApiService'];

    function ProfilePictureService (CameraService, S3Service, UserService, ApiService) {
        const service = {};

        service.takeProfilePicture = () => CameraService.getPicture()
            .then(imageUri => CameraService.crop(imageUri, 400, 400, true));

        service.uploadProfilePicture = blob => S3Service.uploadPhoto(blob, 'profile/profile')
            .then(result => service.setProfilePicture(result.Location)); // result.Location is url

        service.getFacebookProfilePictureUrl = () => {
            return UserService.socialId
                ? 'https://graph.facebook.com/' + UserService.socialId + '/picture?width=400&height=400'
                : null;
        }

        service.useFacebookProfilePicture = () => service.setProfilePicture(service.getFacebookProfilePictureUrl());

        service.setProfilePicture = url => ApiService.request('adduserphotoPost', {}, {
            photoLink: url
        }).then(response => {
            UserService.photoLink = response.data.Attributes.photoLink;
            UserService.thumbnailLink = UserService.photoLink
                ? UserService.photoLink.replace('/profile/profile.png', '/profile-thumbnail/profile-resized.png' + '?' + Date.now())
                : '';

            return UserService.photoLink;
        });

        return service;
    }
})();
