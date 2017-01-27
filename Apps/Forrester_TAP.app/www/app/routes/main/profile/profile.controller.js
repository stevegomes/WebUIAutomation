(function () {
    'use strict';

    angular
        .module('ftap')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$scope', '$timeout', '$ionicActionSheet', 'AuthService', 'LocationService', 'UserService', 'ProfilePictureService'];

    function ProfileController ($scope, $timeout, $ionicActionSheet, AuthService, LocationService, UserService, ProfilePictureService) {
        var self = this;

        self.hasFacebook = AuthService.isUsingFacebook();
        self.photoLoaded = false;

        self.user = {
            photoLink: UserService.photoLink,
            name: UserService.name || UserService.username,
            location: UserService.location,

            stats: [
                { name: 'love', number: null },
                { name: 'ok',   number: null },
                { name: 'hate', number: null }
            ]
        };

        self.choosePhoto = choosePhoto;

        activate();

        function activate () {

            if (!self.user.location && LocationService.lastKnownLocation) {
                LocationService.getPlaceName({
                    lat: LocationService.lastKnownLocation.coords.latitude,
                    lng: LocationService.lastKnownLocation.coords.longitude
                }).then(placeName => self.user.location = placeName);
            }

            UserService.registerUser(UserService.socialId, UserService.email, ProfilePictureService.getFacebookProfilePictureUrl(), UserService.username)
                .then(response => {
                    setPhoto(response.data.photoLink || 'app/img/fallback-profile-image.png');

                    self.user.stats[0].number = response.data.loveCount || 0;
                    self.user.stats[1].number = response.data.okCount || 0;
                    self.user.stats[2].number = response.data.hateCount || 0;
                });
        }

        function choosePhoto () {
            let buttons = [
                { text: (ionic.Platform.isAndroid() ? '<i class="icon ion-android-camera"></i> ' : '') + 'Take a Photo' },
                { text: (ionic.Platform.isAndroid() ? '<i class="icon ion-android-person"></i> ' : '') + 'Use Facebook Photo' }
            ];

            if (!self.hasFacebook) {
                buttons.pop();
            }

            const hideSheet = $ionicActionSheet.show({
                titleText: 'Choose a Photo',
                buttons: buttons,
                cancelText: '<strong>Cancel</strong>',
                cancel: () => {},
                buttonClicked: index => {
                    if (index === 0) {
                        takePhoto();
                    } else if (index === 1) {
                        facebookPhoto();
                    }

                    hideSheet();
                }
            });
        }

        function takePhoto () {
            ProfilePictureService.takeProfilePicture()
                .then(blob => {
                    const reader = new FileReader;

                    reader.onload = () => $scope.$apply(setPhoto(reader.result));
                    reader.readAsDataURL(blob);

                    return ProfilePictureService.uploadProfilePicture(blob);
                })
                .catch(err => console.error(err));
        }

        function facebookPhoto () {
            ProfilePictureService.useFacebookProfilePicture()
                .then(photoLink => setPhoto(photoLink))
                .catch(err => console.error(err));
        }

        function setPhoto (photoLink) {
            if (self.user.photoLink && self.user.photoLink !== photoLink) {
                self.photoLoaded = false;
                self.user.photoLink = '';

                $timeout(() => self.user.photoLink = photoLink, 300); // wait for picture fade out animation to complete
            } else {
                self.user.photoLink = photoLink;
            }
        }
    }
})();
