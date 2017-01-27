/*global AWS AWSCognito*/
(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$window', '$q', 'FTAP_CONFIG', 'FacebookService', 'ApiService', 'UserService', 'ProfilePictureService'];

    function AuthService ($window, $q, FTAP_CONFIG, FacebookService, ApiService, UserService, ProfilePictureService) {
        AWS.config.region = FTAP_CONFIG.AWS_REGION;
        AWS.config.logger = console;
        initializeAWSCredentials();

        AWSCognito.config.region = FTAP_CONFIG.AWS_REGION;
        AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: FTAP_CONFIG.IDENTITY_POOL_ID,
            RoleArn: FTAP_CONFIG.USER_POOL_ARN
        });

        // dummy data, necessary for user pools that don't allow unauthenticated access
        AWSCognito.config.update({
            accessKeyId: 'anything',
            secretAccessKey: 'anything'
        });

        const poolData = {
            UserPoolId: FTAP_CONFIG.USER_POOL_ID,
            ClientId: FTAP_CONFIG.USER_POOL_CLIENT_ID,
            Paranoia: 7
        };

        const userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

        const service = {
            anonymousLogin,
            emailSignup,
            emailLogin,
            facebookAuth,
            facebookLink,
            facebookUnlink,
            checkFacebookLoginStatus,
            checkEmailLoginStatus,
            logOut,
            isUsingFacebook,
            isUsingEmail
        };

        return service;

        ///

        function anonymousLogin () {
            return $q(
                (resolve, reject) => {
                    initializeAWSCredentials();

                    AWS.config.credentials.get(err => {
                        if (err) {
                            reject(err);
                        } else {
                            UserService.registerUser(null, null, null, null);
                            resolve();
                        }
                    })
                }
            );
        }

        function emailSignup (name, email, username, password) {
            const deferred = $q.defer();

            userPool.signUp(username, password, [
                new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
                    Name: 'name',
                    Value: name
                }),

                new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
                    Name: 'email',
                    Value: email
                }),

                new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
                    Name: 'preferred_username',
                    Value: username
                })
            ], null, (err, result) => {
                if (err) {
                    deferred.reject(err);
                }

                UserService.username = username;
                UserService.email = email;

                deferred.resolve(result);
            });

            return deferred.promise
                .then(() => emailLogin(username, password, true))
                .then(() => UserService.registerUser(null, email, null, username));
        }

        function emailLogin (username, password, skipRegister) {
            const deferred = $q.defer();
            const cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
                Username: username,
                Pool: userPool
            });

            cognitoUser.authenticateUser(
                new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
                    Username: username,
                    Password: password,
                }),

                {
                    onSuccess: result => {
                        UserService.username = username;

                        AWS.config.credentials.params.Logins = {};
                        AWS.config.credentials.params.Logins['cognito-idp.' + FTAP_CONFIG.AWS_REGION + '.amazonaws.com/' + FTAP_CONFIG.USER_POOL_ID] = result.idToken.jwtToken;
                        AWS.config.credentials.expired = true;

                        AWS.config.credentials.get(err => {
                            // TODO this should probably be handled in one spot
                            // with the actual response
                            UserService.cogId = AWS.config.credentials.identityId;
                            if (err) {
                                cognitoUser.signOut();
                                deferred.reject(err);
                            } else {
                                deferred.resolve();
                            }
                        });
                    },

                    onFailure: err => deferred.reject(err),
                }
            );

            return skipRegister
                ? deferred.promise
                : deferred.promise
                    .then(() => UserService.registerUser(null, null, null, username))
                    .then(response => {
                        if (response.data.socialid) {
                            return $q((resolve, reject) => checkFacebookLoginStatus()
                                .then(resolve)
                                .catch(() => facebookAuth().then(resolve).catch(reject))
                            );
                        } else {
                            return response;
                        }
                    });
        };

        function facebookAuth () {
            return facebookLogin()
            .then(() => FacebookService.getMyInfo())
            .then(info => {
                UserService.birthYear = info.birthday.split("/")[2];
                UserService.city = info.location.name.split(",")[0];
                UserService.email = info.email;
                UserService.gender = info.gender;
                UserService.location = info.location.name;
                UserService.name = info.name;
                UserService.socialId = info.id;

                return UserService.registerUser(
                    info.id,
                    info.email,
                    ProfilePictureService.getFacebookProfilePictureUrl(),
                    info.username
                );
            });
        };

        function facebookLink () {
            return facebookLogin()
                .then(() => FacebookService.getMyInfo())
                .then(info => {
                    UserService.birthYear = info.birthday.split("/")[2];
                    UserService.city = info.location.name.split(",")[0];
                    UserService.email = info.email;
                    UserService.gender = info.gender;
                    UserService.location = info.location.name;
                    UserService.name = info.name;
                    UserService.socialId = info.id;

                    return UserService.updateSocialId(ProfilePictureService.getFacebookProfilePictureUrl());
                })
                .catch(err => {
                    // clear out facebook info if link failed
                    UserService.birthYear = null;
                    UserService.city = null;
                    UserService.email = null;
                    UserService.gender = null;
                    UserService.location = null;
                    UserService.name = null;
                    UserService.socialId = null;
                    UserService.timestamp = null;


                    return $q.reject(err);
                });
        }

        function facebookUnlink () {
            return $q(
                resolve => facebookConnectPlugin.logout(resolve, resolve)
            )
            .then(() => $q(
                (resolve, reject) => {
                    let cognitoidentity = new AWS.CognitoIdentity();

                    // NOTE: Doing this unlink disables the current Cognito identityId, so a new one is generated.
                    // Essentially, this means that the user is starting a new anonymous account. This is a feature of
                    // Cognito, not a bug; it's a security risk to have an account go from unauthenticated access to
                    // authenticated access only and then back to unauthenticated access.
                    cognitoidentity.unlinkIdentity({
                        IdentityId: AWS.config.credentials.identityId,
                        Logins: AWS.config.credentials.params.Logins,
                        LoginsToRemove: [ 'graph.facebook.com' ]
                    }, (err, data) => err ? reject(err) : resolve(data));
                }
            ))
            .then(() => {
                UserService.birthYear = null;
                UserService.city = null;
                UserService.email = null;
                UserService.gender = null;
                UserService.location = null;
                UserService.name = null;
                UserService.socialId = null;
                UserService.timestamp = null;

                delete AWS.config.credentials.params.Logins['graph.facebook.com'];
            });
        }

        function facebookLogin () {
            return $q((resolve, reject) => {
                facebookConnectPlugin.logout(doLogin, doLogin); // make sure the user is actually logged out before attempting login
                                                                // (otherwise, an error will be thrown)
                function doLogin () {
                    facebookConnectPlugin.login(
                        [ 'public_profile', 'user_friends', 'email' ],

                        result => {
                            AWS.config.credentials.params.Logins = AWS.config.credentials.params.Logins || {};
                            AWS.config.credentials.params.Logins['graph.facebook.com'] = result.authResponse.accessToken;
                            AWS.config.credentials.expired = true;

                            AWS.config.credentials.get(err => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });

                            // Native Tap should display Facebook sharing slider
                            if ($window.NativeTap) {
                                NativeTap.setProfileSettings({
                                    isLoggedInFacebook: true,
                                });
                            }
                        },

                        reject
                    );
                }
            })
        }

        function checkFacebookLoginStatus () {
            return $q(
                (resolve, reject) => FacebookService
                    .checkLoginStatus()
                    .then(result => {
                        if (result.authResponse) {
                            AWS.config.credentials.params.Logins = {
                                'graph.facebook.com': result.authResponse.accessToken
                            };
                            AWS.config.credentials.expired = true;

                            AWS.config.credentials.get(err => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        } else {
                            reject(result);
                        }
                    })
                    .catch(reject)
            )
            .then(() => FacebookService.getMyInfo())
            .then(info => {
                UserService.birthYear = info.birthday.split("/")[2];
                UserService.city = info.location.name.split(",")[0];
                UserService.email = info.email;
                UserService.gender = info.gender;
                UserService.location = info.location.name;
                UserService.name = info.name;
                UserService.socialId = info.id;

                return UserService.registerUser(
                    info.id,
                    info.email,
                    ProfilePictureService.getFacebookProfilePictureUrl(),
                    info.username
                );
            });
        }

        function checkEmailLoginStatus () {
            return $q((resolve, reject) => {
                const cognitoUser = userPool.getCurrentUser();

                if (cognitoUser != null) {
                    cognitoUser.getSession((err, session) => {
                        if (err) {
                            cognitoUser.signOut();
                            return reject(err);
                        }

                        AWS.config.credentials.params.Logins = {};
                        AWS.config.credentials.params.Logins['cognito-idp.' + FTAP_CONFIG.AWS_REGION + '.amazonaws.com/' + FTAP_CONFIG.USER_POOL_ID] = session.idToken.jwtToken;
                        AWS.config.credentials.expired = true;

                        AWS.config.credentials.get(err => {
                            if (err) {
                                cognitoUser.signOut();
                                return reject(err);
                            }

                            return resolve(cognitoUser.getUsername());
                        });
                    })
                } else {
                    reject();
                }
            })
            .then(username => {
                UserService.username = username;
                return UserService.registerUser(null, null, null, username);
            });
        }

        function logOut () {
            return $q((resolve, reject) => {
                if (service.isUsingEmail()) {
                    userPool.getCurrentUser().signOut();
                }

                if (service.isUsingFacebook()) {
                    facebookConnectPlugin.logout(
                        () => {
                            initializeAWSCredentials();
                            resolve();

                            // Native Tap should not display Facebook sharing slider
                            if ($window.NativeTap) {
                                NativeTap.setProfileSettings({
                                    isLoggedInFacebook: false,
                                });
                            }
                        },

                        reject
                    );
                } else {
                    initializeAWSCredentials();
                    resolve();
                }
            });
        }

        function isUsingFacebook () {
            return AWS.config.credentials
                && AWS.config.credentials.params
                && AWS.config.credentials.params.Logins
                && AWS.config.credentials.params.Logins['graph.facebook.com'];
        }

        function isUsingEmail () {
            return AWS.config.credentials
                && AWS.config.credentials.params
                && AWS.config.credentials.params.Logins
                && AWS.config.credentials.params.Logins['cognito-idp.' + FTAP_CONFIG.AWS_REGION + '.amazonaws.com/' + FTAP_CONFIG.USER_POOL_ID]
        }

        function initializeAWSCredentials () {
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: FTAP_CONFIG.IDENTITY_POOL_ID
            });
            // the line below is needed for the current facebook/user pools auth implementation, but not cognito unauth
            // AWS.config.credentials.clearCachedId();
        }
    }
})();
