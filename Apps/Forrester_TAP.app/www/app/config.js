(function () {
    'use strict';

    angular
        .module('ftap')
        .constant('FTAP_CONFIG', {
            GOOGLE_API_KEY: '@@GOOGLE_API_KEY',
            IDENTITY_POOL_ID: '@@IDENTITY_POOL_ID',
            AWS_REGION: '@@AWS_REGION',
            USER_POOL_ID: '@@USER_POOL_ID',
            USER_POOL_ARN: '@@USER_POOL_ARN',
            USER_POOL_CLIENT_ID: '@@USER_POOL_CLIENT_ID',
            S3_PHOTO_BUCKET: '@@S3_PHOTO_BUCKET',
            S3_RESOURCE_BUCKET: '@@S3_RESOURCE_BUCKET',
            GCM_SENDER_ID: '@@GCM_SENDER_ID',
            MOBILE_ANALYTICS_APP_ID: '@@MOBILE_ANALYTICS_APP_ID',
            A_OR_B: '@@A_OR_B',
            VERSION_NUMBER: '@@VERSION_NUMBER',
            SHOW_DEBUG_INFO: '@@SHOW_DEBUG_INFO' === 'true',
        });
})();
