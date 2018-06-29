const AWS = require('aws-sdk');
const logWrapper = require('../utils/logWrapper');

exports.track = function(deviceId, event, context, challengeName) {
  const  dynamo = new AWS.DynamoDB();
  const eParams = exports.paramsForGetItem(deviceId, event);
   dynamo.getItem(eParams, function(err, data) {
    if (err) {
        logWrapper.logExceptOnTest(err, err.stack);
        context.fail(err);
    } else {
        logWrapper.logExceptOnTest(data);
        if( data.Item ) {
          if( challengeName === 'DEVICE_CHALLENGE') {
            exports.manageVerifiedDevice(data, event, context, false);
          } else if( challengeName === 'OTP_CHALLENGE') {
            exports.manageVerifiedDevice(data, event, context, true);
          } else {
            context.fail(err);
          }
        } else {
          exports.manageNonVerifiedDevice(deviceId, event, context);
        }
    }
 });
}

exports.paramsForGetItem = function(deviceId, event) {
  return {
    Key: {
     "Username": {
       S: event.userName
      },
     "DeviceId": {
       S: deviceId
      }
    },
    TableName: process.env.DYNAMO_TABLENAME
   };
};

/**
 * PRIVATE: This is only to be used internally
 *
 * @param {*} dynamoRecord
 * @param {*} event
 * @param {*} context
 */
exports.manageVerifiedDevice = function(dynamoRecord, event, context, updateIfOverAllowedAge = false) {
  if( exports.overAllowedAge(dynamoRecord.Item.date.N) ) {
    if( updateIfOverAllowedAge ) {
      let deviceId = dynamoRecord.Item.DeviceId.S;
      exports.saveDeviceToDynamo(deviceId, Date.now(), event, context, false );
    } else {
      event.response.answerCorrect = false;
    }
  } else {
     event.response.answerCorrect = true;
  }
 context.succeed(event);
}

/**
 * PRIVATE: This is only to be used internally
 *
 * @param {*} deviceId
 * @param {*} event
 * @param {*} context
 */
exports.manageNonVerifiedDevice = function(deviceId, event, context) {
  let idp = new AWS.CognitoIdentityServiceProvider({
    region: process.env.COGNITO_REGION
  });
  const params = exports.paramsForGettingTrackedDevice(deviceId, event);

  idp.adminGetDevice(params, function(err, data) {
     if (err) {
        logWrapper.logExceptOnTest(err, err.stack);
        if( err.code === "ResourceNotFoundException") {
          //device not in dynamo or tracked.  first time login?  validate device
          logWrapper.logExceptOnTest("unable to find the device, present challenge");
          event.response.answerCorrect = false;
          context.succeed(event);
        } else {
          event.response.answerCorrect = false;
          context.fail(err);
        }
     } else {
        let createdDate = Date.parse(data.Device.DeviceCreateDate);
        exports.saveDeviceToDynamo(deviceId, createdDate, event, context, true );
     }
  });
};

/**
 * PRIVATE: This is only to be used internally
 *
 * @param {*} deviceId
 * @param {*} event
 */
exports.paramsForGettingTrackedDevice = function(deviceId, event) {
  return {
    DeviceKey: deviceId,
    UserPoolId: process.env.USER_POOL_ID,
    Username: event.userName
  };
};

/**
 * PRIVATE: This is only to be used internally
 *
 * @param {*} deviceId
 * @param {*} time
 * @param {*} event
 * @param {*} context
 * @param {*} setResponseAnswerCorrect
 */
exports.saveDeviceToDynamo = function(deviceId, time, event, context, setResponseAnswerCorrect ) {
  const dynamo = new AWS.DynamoDB();

  const params = exports.paramsForStoringTrackedDeviceCounter(deviceId, time, event);

  dynamo.updateItem(params, function(err, data) {
       if (err) {
           logWrapper.logExceptOnTest('Error while saving device');
           logWrapper.logExceptOnTest(err, err.stack);
           context.fail(err);
       } else {
           logWrapper.logExceptOnTest('Successfully saved device');
           logWrapper.logExceptOnTest(data);
           if( setResponseAnswerCorrect ) {
               if( exports.overAllowedAge(time) ) {
                   event.response.answerCorrect = false;
               } else {
                   event.response.answerCorrect = true;
               }
           }

           context.succeed(event);
       }
  });
};

/**
 * PRIVATE: This is only to be used internally
 *
 * @param {*} deviceId
 * @param {*} time
 * @param {*} event
 */
exports.paramsForStoringTrackedDeviceCounter = function(deviceId, time, event) {
  return {
        ExpressionAttributeNames: {
         "#d": "date",
        },
        ExpressionAttributeValues: {
         ":d": {
           N: time.toString()
          }
        },
        Key: {
         "Username": {
           S: event.userName
          },
         "DeviceId": {
           S: deviceId
          }
        },
        TableName: process.env.DYNAMO_TABLENAME,
        UpdateExpression: "SET #d = :d"
       };
};

/**
 * PRIVATE: This is only to be used internally
 *
 * @param {*} createdDate
 */
exports.overAllowedAge = function(createdDate) {
  let now = Date.now();

  let difference = now - createdDate;
  logWrapper.logExceptOnTest("time difference = " + difference);
  if( difference > Number.parseInt(process.env.MAX_VALID_TIME_DEVICE) ) {
      logWrapper.logExceptOnTest("it's been more than 30 days");
      return true;
  } else {
      logWrapper.logExceptOnTest("it's has not been more than 30 days");
      return false;
  }
};
