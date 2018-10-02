const OtpChallengeService = require('../../aws/OtpChallengeService');


exports.handler = function(event, context) {
    if( shouldDoOtpChallenge(event.request.session.slice(-1)[0]) ) {
        const email = event.request.userAttributes.email;
        OtpChallengeService.setupOtpChallenge(email, event, context);
    } else {
        //we just want the device id back here.
        event.response.publicChallengeParameters = {};
        event.response.privateChallengeParameters = {};
        event.response.privateChallengeParameters.challenge = 'DEVICE_CHALLENGE';
        let uniqueId = Math.random().toString(36).substring(7);
        event.response.privateChallengeParameters.uniqueId = "UNIQUE-KEY-" + uniqueId;
        event.response.challengeMetadata = event.response.privateChallengeParameters.uniqueId;
        context.succeed(event);
    }
}

function shouldDoOtpChallenge(lastSession) {
    //if challengeMetadata is no empty we have already gotten the deviceId
    return lastSession.challengeMetadata && lastSession.challengeMetadata.startsWith('UNIQUE-KEY');
}


