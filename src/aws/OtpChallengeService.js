const AWS = require('aws-sdk');
const logWrapper = require('../utils/logWrapper');
const EmailService = require('./EmailService');
const maskEmail = require('../utils//maskEmail');

exports.setupOtpChallenge = function(email, event, context) {
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: email 
      };

    /* eslint-disable no-unused-vars */
    cognitoidentityserviceprovider.adminGetUser(params, function(err, data) {
        if (err) {
            logWrapper.logExceptOnTest(err, err.stack); 
            logWrapper.logExceptOnTest(event);
            logWrapper.logExceptOnTest(context);
            context.fail(err);
        }    
        else {
            logWrapper.logExceptOnTest(`${email} attributes retreived`);

            const found = data.UserAttributes.find(function (element) {
                return element.Name === 'custom:automation';
            });
            let token = exports.generateToken();
            if (found && found.Value === 't') {
                logWrapper.logExceptOnTest('Automation user, default OTP');
                token = process.env.AUTOMATION_OTP;
            } else { 
                logWrapper.logExceptOnTest('Not an Automation user');
            }
            event.response.publicChallengeParameters = {};
            event.response.publicChallengeParameters.maskedEmail = maskEmail.mask(email);
            event.response.privateChallengeParameters = {};
            event.response.privateChallengeParameters.answer = token;
            event.response.privateChallengeParameters.challenge = 'OTP_CHALLENGE';
            event.response.challengeMetadata = 'OTP_CHALLENGE';
            
            EmailService.sendEmail(email, token, event, context);
        }
    });  
    /* eslint-enable no-unused-vars */
    
}

exports.generateToken = function() {
    return Math.random().toString(36).substring(7);
}
