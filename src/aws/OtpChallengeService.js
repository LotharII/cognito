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

            let token = '';
            let incomingMetadata = '' 
            if (event.request.session) {
                incomingMetadata = event.request.session[event.request.session.length - 1].challengeMetadata;
            }
            
            if (incomingMetadata.startsWith('UNIQUE-KEY')) {
              
                if (found && found.Value === 't') {
                    logWrapper.logExceptOnTest('Automation user, default OTP');
                    token = process.env.AUTOMATION_OTP;
                } else {
                    token = exports.generateToken();
                    logWrapper.logExceptOnTest('Not an Automation user');
                }
                EmailService.sendEmail(email, token, event, context);         
            } else {
                token = incomingMetadata;
            }
            
            event.response.publicChallengeParameters = {};
            event.response.publicChallengeParameters.maskedEmail = maskEmail.mask(email);
            event.response.privateChallengeParameters = {};
            event.response.privateChallengeParameters.answer = token;
            event.response.privateChallengeParameters.challenge = 'OTP_CHALLENGE';
            event.response.challengeMetadata = token;
        }
    });  
    /* eslint-enable no-unused-vars */
    
}

exports.generateToken = function() {
    return Math.random().toString(36).substring(7);
}
