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
                    Data: "Your Device validation token is " + token
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
