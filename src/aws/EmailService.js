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
                Text: {
                  //template or environment variable
                  Data: `Hello ${event.request.userAttributes.given_name},\n\nYour Device Validation Token is ${token}\nSimply copy this token and paste it into the device validation input field.`
                }
            },
            Subject: {
              //template or environment variable
                Data: "CWDS - CARES Device Validation Token"
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
