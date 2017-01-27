(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('CameraService', CameraService);

    CameraService.$inject = ['$q', '$window'];

    function CameraService ($q, $window) {
        const service = {};

        service.getPicture = () => $q((resolve, reject) =>
            $window.navigator.camera.getPicture(resolve, reject, {
                quality: 30,
                destinationType: $window.Camera.DestinationType.FILE_URI,
                correctOrientation: true
            })
        );

        service.cleanup = () => $q((resolve, reject) =>
            $window.navigator.camera.cleanup(resolve, reject)
        );

        service.crop = (imageUri, width, height, returnBlob) => $q((resolve, reject) => {
            try {
                const image = document.createElement('img');
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                canvas.width = width;
                canvas.height = height;

                image.src = imageUri;
                image.onload = () => {
                    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
                    context.drawImage(
                        image,
                        (canvas.width - (image.width * scale)) / 2,
                        (canvas.height - (image.height * scale)) / 2,
                        image.width * scale,
                        image.height * scale
                    );

                    if (returnBlob) {
                        canvas.toBlob(resolve, 'image/png');
                    } else {
                        resolve(canvas.toDataURL('image/png'));
                    }
                };
            } catch (e) {
                reject(e);
            }
        });

        return service;
    }
})();
