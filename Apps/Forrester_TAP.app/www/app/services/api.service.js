(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('ApiService', ApiService);

    ApiService.$inject = ['$q', '$injector'];

    function ApiService ($q, $injector) {
        const service = {};

        service.request = (verb, params, body, additionalParams) => $q((resolve, reject) => {
            if (AWS.config.credentials.needsRefresh()) {
                // the below method of credential refreshing should only work for unauthenticated users

                AWS.config.credentials.refresh(err => {
                    if (err) {
                        return reject(err);
                    }

                    service.request(verb, params, body, additionalParams).then(resolve).catch(reject);
                });

                // below is for facebook/email auth

                /* const AuthService = $injector.get('AuthService');

                if (AuthService.isUsingFacebook()) {
                    AuthService.checkFacebookLoginStatus()
                    .then(result =>
                        service.request(verb, params, body, additionalParams).then(resolve).catch(reject)
                    )
                    .catch(reject);
                } else {
                    AuthService.checkEmailLoginStatus()
                    .then(result =>
                        service.request(verb, params, body, additionalParams).then(resolve).catch(reject)
                    )
                    .catch(reject);
                } */
            } else {
                let apigClient = apigClientFactory.newClient({
                    accessKey: AWS.config.credentials.accessKeyId,
                    secretKey: AWS.config.credentials.secretAccessKey,
                    sessionToken: AWS.config.credentials.sessionToken
                });

                if (angular.isDefined(apigClient[verb])) {
                    apigClient[verb](params, body, additionalParams).then(resolve).catch(reject);
                } else {
                    reject("Verb not defined in API Gateway");
                }
            }
        });

        return service;
    }
})();
