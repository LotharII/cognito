var AWS = require('aws-sdk');
var logWrapper = require('../utils/logWrapper');

exports.sendEmail = function(email, token, event, context) {
    var  ses = new AWS.SES({
      region: process.env.SES_REGION
    });
    var eParams = {
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Body: {
                Html: {
                   //template or environment variable
                  Data: `<h2>CWS-CARES Secure Account Verification</h2><h1>Verification Code</h1><div>Here is your Access Code:</div><h1>${token}</h1><div>This is a validation code, not a password.</div><div>Simply copy this code and paste it into the Account Verification input field.</div><br><br><div>Thanks for helping us verify your CWS-CARES account.</div><div>CWS-CARES</div>`
                }
            },
            Subject: {
              //template or environment variable
                Data: "CWDS - CARES Secure Account Verification"
            }
        },
        //environment variable
        Source: process.env.SOURCE_EMAIL
    };

    /* eslint-disable no-unused-vars */
    ses.sendEmail(eParams, function(err, data){
      if(err) {
        logWrapper.logExceptOnTest("FAILURE SENDING EMAIL - Device Verify OTP");
        logWrapper.logExceptOnTest(event);
        logWrapper.logExceptOnTest(context);
        context.fail(err);
      }
      else {
        logWrapper.logExceptOnTest("Device Verify OTP sent");
        context.succeed(event);
      }
    });
    /* eslint-enable no-unused-vars */
}
