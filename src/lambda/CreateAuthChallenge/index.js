var EmailService = require('../../aws/EmailService');
var maskEmail = require('../../utils//maskEmail');


exports.handler = function(event, context) {
    if( shouldDoOtpChallenge(event.request.session.slice(-1)[0]) ) {
        let token = generateToken();
        //last session we request for the device id, no we send out the real challenge
        let email = event.request.userAttributes.email;

        event.response.publicChallengeParameters = {};
        event.response.publicChallengeParameters.maskedEmail = maskEmail.mask(email);
        event.response.privateChallengeParameters = {};
        event.response.privateChallengeParameters.answer = token;
        event.response.privateChallengeParameters.challenge = 'OTP_CHALLENGE';
        event.response.challengeMetadata = 'OTP_CHALLENGE';

        

        EmailService.sendEmail(email, token, event, context);
    } else {
        //we just want the device id back here.
        event.response.publicChallengeParameters = {};
        event.response.privateChallengeParameters = {};
        event.response.privateChallengeParameters.challenge = 'DEVICE_CHALLENGE';
        let uniqueId = generateToken();
        event.response.privateChallengeParameters.uniqueId = "UNIQUE-KEY-" + uniqueId;
        event.response.challengeMetadata = event.response.privateChallengeParameters.uniqueId;
        context.succeed(event);
    }
}

function shouldDoOtpChallenge(lastSession) {
    //if challengeMetadata is no empty we have already gotten the deviceId
    return lastSession.challengeMetadata;
}

function generateToken() {
    return Math.random().toString(36).substring(7);
}
