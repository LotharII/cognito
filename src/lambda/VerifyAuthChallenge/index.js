var deviceTrackingService = require('../../aws/DeviceTrackingService');
var logWrapper = require('../../utils//logWrapper');

exports.handler = function(event, context) {
  logWrapper.logExceptOnTest(event);
  let challenge = event.request.privateChallengeParameters.challenge;
  if( challenge === 'DEVICE_CHALLENGE') {
    handleDeviceChallenge(event, context);
  } else if( challenge === 'OTP_CHALLENGE') {
    handleOtpChallenge(event, context);
  } else {
    context.fail(event);
  }
};

function getDeviceId(answers) {
    return ( answers[1] === 'undefined' || answers[1] === 'null' ) ? null : answers[1];
}

function getOtp(answers) {
    return answers[0];
}

function handleOtpChallenge(event, context) {
    let answers = event.request.challengeAnswer.split(" ");
    let otp = getOtp(answers);
    if (event.request.privateChallengeParameters.answer === otp) {
        event.response.answerCorrect = true;
        //if it has been more than 30 days, update the device
        let deviceId = getDeviceId(answers);
        logWrapper.logExceptOnTest('deviceId=' + deviceId);
        if( deviceId ) {
            deviceTrackingService.track(deviceId, event, context, event.request.privateChallengeParameters.challenge);
        } else {
            handleNoDeviceIdPassedInOnSuccessfulOtpChallenge(event, context) ;
        }
    } else {
         event.response.answerCorrect = false;
         context.done(null, event);
    }
}

function handleNoDeviceIdPassedInOnSuccessfulOtpChallenge(event, context) {
    //no deviceId was passed in - this means it doesn't exist yet because the user
    //has not logged in yet on this device so we aren't tracking
    //this will be first login so device will now be tracked.  We will save device
    //to dynamo on the next login
    context.succeed(event);
}

function handleDeviceChallenge(event, context) {
    logWrapper.logExceptOnTest('handleDeviceChallenge');
    let deviceId = event.request.challengeAnswer;
    logWrapper.logExceptOnTest('DeviceId=' + deviceId);

    if( deviceId === "null" ) {
      handleNullDeviceId(event, context);
    } else {
      deviceTrackingService.track(deviceId, event, context, event.request.privateChallengeParameters.challenge);
    }
}

/*
 * when deviceId is null this means the user has never logged in so we haven't started tracking a device yet
 */
function handleNullDeviceId(event, context) {
    logWrapper.logExceptOnTest('NO device id sent from client');
    event.response.answerCorrect = false;
    context.succeed(event);
    return;
}
