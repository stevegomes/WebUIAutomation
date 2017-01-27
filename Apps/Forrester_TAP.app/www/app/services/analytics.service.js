(function () {
    'use strict';

    angular
        .module('ftap')
        .factory('AnalyticsService', AnalyticsService);

    AnalyticsService.$inject = ['$injector', 'FTAP_CONFIG', 'AuthService', 'UserService', 'SharingService'];

    // AWS config credentials are set when AuthService is instantiated
    function AnalyticsService($injector, FTAP_CONFIG, AuthService, UserService, SharingService) {
        const service = {
            client: new AMA.Manager({
                appId: FTAP_CONFIG.MOBILE_ANALYTICS_APP_ID,
            })
        };

        const APP_NAME = 'Forrester TAP';

        service.recordStart = () => {
            service.client.recordEvent('appStart');
        };

        service.recordResume = () => {
            service.client.recordEvent('appResume');
        };

        service.recordTap = duration => {
            service.client.recordEvent('tapSubmitted', {}, { duration });
        };

        /**
         * screenNames:
         * <Splash, FB Signup, Email Signup, Success, FB Login, Email Login,
         *  Main TAP, Love TAP, OK TAP, Hate TAP, Love Location, Location Details,
         *  Map View, Map Filter, Map Detail, MOBs View, MOBs Filter, My Feed, Post,
         *  MOBs, Settings>
         */

        service.recordEvent = (eventType, screenName, attributes, metrics) => {
            let LocationService = $injector.get('LocationService');
            let locationMetrics = LocationService.hasLocation
                ? {
                    profile_location_enabled: 1,
                    session_location_lat: LocationService.lastKnownLocation.coords.latitude,
                    session_location_lon: LocationService.lastKnownLocation.coords.longitude
                }
                : {
                    profile_location_enabled: 0,
                };

            let sharing = SharingService.facebook ? 1 : 0;

            service.client.recordEvent(
                eventType,
                angular.extend({
                    "profile_signupDate": UserService.timestamp || "N/A",
                    "profile_gender": UserService.gender || "N/A",
                    "profile_city": UserService.city || "N/A",
                    "profile_birthYear": UserService.birthYear || "N/A",
                    "ctx_screenName": screenName,
                    "ctx_appName": APP_NAME,
                }, attributes || {}),
                angular.extend(locationMetrics, {
                    "profile_LOVEs": UserService.loveCount,
                    "profile_OKs": UserService.okCount,
                    "profile_HATEs": UserService.hateCount,
                    "profile_shareFB": sharing,
                    "profile_notifications_enabled": UserService.notifs,
                }, metrics || {})
            );
        };

        service.screenView = screenName => {
            service.recordEvent('SCREENVIEW', screenName);
        };

        return service;
    }
})();
