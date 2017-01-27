(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('S3Service', S3Service);

    S3Service.$inject = ['$q', 'FTAP_CONFIG', 'UserService'];

    function S3Service ($q, FTAP_CONFIG, UserService) {
        const service = {};

        // Upload user-specific photos for Taps and profile pictures
        service.uploadPhoto = (blob, name) => $q(
            (resolve, reject) => {
                name = name || Date.now();

                const bucket = new AWS.S3({
                    params: {
                        Bucket: FTAP_CONFIG.S3_PHOTO_BUCKET
                    }
                });

                bucket.upload({
                    Key: AWS.config.credentials.identityId + '/' + name + '.png', // filename
                    Body: blob,
                    ContentType: 'image/png'
                }, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            }
        );

        return service;
    }
})();
