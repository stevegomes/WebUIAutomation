cordova.define("cordova-plugin-forrester-tap.NativeTap", function(require, exports, module) {
var exec = require('cordova/exec');

exports.show = function (success, error, data) {
    exec(success, error, 'NativeTap', 'show', [ JSON.stringify(data) ]);
};

exports.hide = function (success, error) {
    exec(success, error, 'NativeTap', 'hide', []);
};

exports.tabHandlers = function (show, hide) {
    exec(show, hide, 'NativeTap', 'tabHandlers', []);
};

exports.requestLocationsHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'requestLocationsHandler', []);
};

exports.setLocations = function (data) {
    exec(null, null, 'NativeTap', 'setLocations', [ JSON.stringify(data) ]);
};

exports.setProfileSettings = function (data) {
    exec(null, null, 'NativeTap', 'setProfileSettings', [ JSON.stringify(data) ]);
};

exports.errorLocations = function(data) {
    console.error('Error retrieving locations:', data);
    exec(null, null, 'NativeTap', 'errorLocations', [ JSON.stringify(data) ]);
};

exports.selectLocation = function(success, error) {
    exec(success, error, 'NativeTap', 'selectLocation', []);
};

exports.getPictureHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'getPictureHandler', []);
};

exports.setPicture = function (imageUri) {
    exec(null, null, 'NativeTap', 'setPicture', [ imageUri ]);
};

exports.sendTapHandler = function(success, error) {
    exec(success, error, 'NativeTap', 'sendTapHandler', []);
};

exports.sendTapSuccess = function () {
    exec(null, null, 'NativeTap', 'sendTapSuccess', []);
};

exports.sendTapFailure = function () {
    exec(null, null, 'NativeTap', 'sendTapFailure', []);
};

exports.setFacebookPreference = function(data) {
    exec(null, null, 'NativeTap', 'setFacebookPreference', [ JSON.stringify(data) ]);
};

exports.dismissCoachMarksHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'dismissCoachMarksHandler', []);
};

exports.getLocationRatingResponsesHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'getLocationRatingResponsesHandler', []);
}

exports.setLocationRatingResponses = function (data) {
    exec(null, null, 'NativeTap', 'setLocationRatingResponses', [ JSON.stringify(data) ]);
}

exports.getThingsHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'getThingsHandler', []);
};

exports.getThingsError = function (err) {
    exec(null, null, 'NativeTap', 'getThingsError', [ err ]);
};

exports.setThings = function (data) {
    exec(null, null, 'NativeTap', 'setThings', [ JSON.stringify(data) ]);
};

exports.getPeopleHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'getPeopleHandler', []);
};

exports.getPeopleError = function (err) {
    exec(null, null, 'NativeTap', 'getPeopleError', [ err ]);
};

exports.setPeople = function (data) {
    exec(null, null, 'NativeTap', 'setPeople', [ JSON.stringify(data) ]);
};

exports.addItemHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'addItemHandler', []);
}

exports.addItemSuccess = function (item) {
    exec(null, null, 'NativeTap', 'addItemSuccess', [ item ]);
}

exports.addItemFailure = function (err) {
    exec(null, null, 'NativeTap', 'addItemFailure', [ err ]);
}

exports.openLocationTap = function (locationItem, mood, successCallback) {
    exec(successCallback, null, 'NativeTap', 'openLocationTap', [ locationItem, mood ]);
}

exports.locationSearchHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'locationSearchHandler', []);
}

exports.locationSearchSuccess = function (results) {
    exec(null, null, 'NativeTap', 'locationSearchSuccess', [ results ]);
}

exports.locationSearchFailure = function (err) {
    exec(null, null, 'NativeTap', 'locationSearchFailure', [ err ]);
}

exports.recordTapDurationHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'recordTapDurationHandler', []);
}

exports.joinMobHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'joinMobHandler', []);
}

exports.joinMobSuccess = function () {
    exec(null, null, 'NativeTap', 'joinMobSuccess', []);
}

exports.joinMobFailure = function () {
    exec(null, null, 'NativeTap', 'joinMobFailure', []);
}

exports.analyticsEventHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'analyticsEventHandler', []);
}

exports.tapMoodHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'tapMoodHandler', []);
}

exports.addItemButtonTappedHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'addItemButtonTappedHandler', []);
}

exports.tapSearchHandler = function (callback) {
    exec(callback, null, 'NativeTap', 'tapSearchHandler', []);
}

});
