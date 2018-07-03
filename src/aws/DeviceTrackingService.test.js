import {expect} from 'chai';
import sinon from 'sinon';

var AWS = require('aws-sdk-mock');
import DeviceTrackingService from './DeviceTrackingService';

process.env.NODE_ENV = 'test';
process.env.DYNAMO_TABLENAME = "TABLE_NAME";
process.env.COGNITO_REGION = 'us-east-2';
process.env.USER_POOL_ID = 'us-east-2_JDIuaVjlq';
process.env.MAX_VALID_TIME_DEVICE = '2592000000';

describe('DeviceTrackingService.js Tests', () => {
  let succeed;
  let fail;
  let context;

  let deviceId = 'device_id';
  let event = {
    userName: 'some_user',
    response: {
      answerCorrect: null
    }
  };


  beforeAll(() => {
    succeed = sinon.fake();
    fail = sinon.fake();

    context = Object.assign({}, {succeed: succeed, fail: fail});
  });

  afterEach(() => {
    succeed.resetHistory();
    fail.resetHistory();
  });

  describe('- track Tests', () => {
    describe('- error returned', () => {
      it('- fails on error', () => {
        //setup
        AWS.mock('DynamoDB', 'getItem', function(params, callback) {
          callback({code: 'unknown'}, null);
        });

        //run
        DeviceTrackingService.track(deviceId, event, context);


        //assert
        expect(fail.calledOnce).to.be.true;
      });
    });

    describe('- no error returned', () => {
      let fakeManageVerifiedDevice;
      let fakeManageNonVerifiedDevice;
      let stubManageVerifiedDevice;
      let stubManageNonVerifiedDevice;

      beforeAll(() => {
        fakeManageVerifiedDevice = sinon.fake();
        fakeManageNonVerifiedDevice = sinon.fake();
        stubManageVerifiedDevice = sinon.stub(DeviceTrackingService, "manageVerifiedDevice").callsFake(fakeManageVerifiedDevice);
        stubManageNonVerifiedDevice = sinon.stub(DeviceTrackingService, "manageNonVerifiedDevice").callsFake(fakeManageNonVerifiedDevice);
      });

      beforeEach(() => {
        fakeManageVerifiedDevice.resetHistory();
        fakeManageNonVerifiedDevice.resetHistory();
        AWS.restore('DynamoDB');
      })

      afterEach(() => {
      });

      afterAll(() => {
        stubManageVerifiedDevice.restore();
        stubManageNonVerifiedDevice.restore();
      });

      describe('- calls manageVerifiedDevice on item return', () => {
        it('- handles DEVICE_CHALLENGE', () => {
          //setup
          let data = {
            Item: 'someitem'
          };

          AWS.mock('DynamoDB', 'getItem', function(params, callback) {
            callback(null, data);
          });

          //run
          DeviceTrackingService.track(deviceId, event, context, 'DEVICE_CHALLENGE');

          //assert
          expect(fakeManageVerifiedDevice.calledOnce, 'manageVerifiedDevice method not called').to.be.true;
          expect(fakeManageNonVerifiedDevice.callCount, 'manageNonVerifiedDevice method called').to.equal(0);
          expect(fakeManageVerifiedDevice.args, 'args incorrect size').to.have.lengthOf(1);
          expect(fakeManageVerifiedDevice.args[0], 'function params incorrect size').to.have.lengthOf(4);
          expect(fakeManageVerifiedDevice.args[0][0], 'first function parameter incorrect').to.equal(data);
          expect(fakeManageVerifiedDevice.args[0][1], '2nd function parameter incorrect').to.equal(event);
          expect(fakeManageVerifiedDevice.args[0][2], '3rd function parameter incorrect').to.equal(context);
          expect(fakeManageVerifiedDevice.args[0][3], '4th function parameter incorrect').to.equal(false);
        });

        it('- handles OTP_CHALLENGE', () => {
          //setup
          let data = {
            Item: 'someitem'
          };

          AWS.mock('DynamoDB', 'getItem', function(params, callback) {
            callback(null, data);
          });

          //run
          DeviceTrackingService.track(deviceId, event, context, 'OTP_CHALLENGE');

          //assert
          expect(fakeManageVerifiedDevice.calledOnce, 'manageVerifiedDevice method not called').to.be.true;
          expect(fakeManageNonVerifiedDevice.callCount, 'manageNonVerifiedDevice method called').to.equal(0);
          expect(fakeManageVerifiedDevice.args, 'args incorrect size').to.have.lengthOf(1);
          expect(fakeManageVerifiedDevice.args[0], 'function params incorrect size').to.have.lengthOf(4);
          expect(fakeManageVerifiedDevice.args[0][0], 'first function parameter incorrect').to.equal(data);
          expect(fakeManageVerifiedDevice.args[0][1], '2nd function parameter incorrect').to.equal(event);
          expect(fakeManageVerifiedDevice.args[0][2], '3rd function parameter incorrect').to.equal(context);
          expect(fakeManageVerifiedDevice.args[0][3], '4th function parameter incorrect').to.equal(true);
        });

        it('- handles unknown challenge', () => {
          //setup
          let data = {
            Item: 'someitem'
          };

          AWS.mock('DynamoDB', 'getItem', function(params, callback) {
            callback(null, data);
          });

          //run
          DeviceTrackingService.track(deviceId, event, context, 'UNKNOWN_CHALLENGE');

          //assert
          expect(fail.calledOnce).to.be.true;
        });
      });

      it('- calls managedNonVerifiedDevice on no item return', () => {
        //setup
        AWS.mock('DynamoDB', 'getItem', function(params, callback) {
          callback(null, {});
        });

        //run
        DeviceTrackingService.track(deviceId, event, context);

        //assert
        expect(fakeManageNonVerifiedDevice.calledOnce, 'manageNonVerifiedDevice method not called').to.be.true;
        expect(fakeManageNonVerifiedDevice.args, 'args incorrect size').to.have.lengthOf(1);
        expect(fakeManageNonVerifiedDevice.args[0], 'function params incorrect size').to.have.lengthOf(3);
        expect(fakeManageNonVerifiedDevice.args[0][0], 'first function parameter incorrect').to.equal(deviceId);
        expect(fakeManageNonVerifiedDevice.args[0][1], '2nd function parameter incorrect').to.equal(event);
        expect(fakeManageNonVerifiedDevice.args[0][2], '3rd function parameter incorrect').to.equal(context);
      });
    });

  });

  describe('- manageVerifiedDevice Tests', () => {
    let fakeSaveDeviceToDynamo;
    let stubSaveDeviceToDynamo;
    let stubDateNow;

    beforeAll(() => {
      fakeSaveDeviceToDynamo = sinon.fake();
      stubSaveDeviceToDynamo = sinon.stub(DeviceTrackingService, "saveDeviceToDynamo").callsFake(fakeSaveDeviceToDynamo);
      
    });

    beforeEach(() => {
      fakeSaveDeviceToDynamo.resetHistory();
    })

    afterEach(() => {
    });

    afterAll(() => {
      stubSaveDeviceToDynamo.restore();
      stubDateNow.restore();
    });

    it('- handles overAllowedAge true', () => {
      //setup
      let record = {
        Item: {
          date: {
            N: 0
          },
          DeviceId: {
            S: 'abc'
          }
        }
      };

      //run
      DeviceTrackingService.manageVerifiedDevice(record, event, context);

      //assert
      expect(event.response.answerCorrect, 'answerCorrect not correct').to.be.false;
      expect(succeed.calledOnce, 'succeed not called').to.betrue;
    });

    describe('- manageVerifiedDevice Tests update true', () => {
      let stubDateNow;
  
      beforeAll(() => {
        stubDateNow = sinon.stub(Date, "now").returns(9999999999);
      });
  
      afterAll(() => {
        stubDateNow.restore();
      });

      it('- saveDeviceToDynamo called when  overAllowedAge true and update true', () => {
      
        let record = {
          Item: {
            date: {
              N: 0
            },
            DeviceId: {
              S: 'device_id'
            }
          }
        };

        //run
        DeviceTrackingService.manageVerifiedDevice(record, event, context, true);

        //assert
        expect(fakeSaveDeviceToDynamo.calledOnce, 'saveDeviceToDynamo method not called').to.be.true;
        expect(fakeSaveDeviceToDynamo.args, 'args incorrect size').to.have.lengthOf(1);
        expect(fakeSaveDeviceToDynamo.args[0], 'function params incorrect size').to.have.lengthOf(5);
        expect(fakeSaveDeviceToDynamo.args[0][0], 'first function parameter incorrect').to.equal(deviceId);
        expect(fakeSaveDeviceToDynamo.args[0][1], '2nd function parameter incorrect').to.equal(9999999999);
        expect(fakeSaveDeviceToDynamo.args[0][2], '3rd function parameter incorrect').to.equal(event);
        expect(fakeSaveDeviceToDynamo.args[0][3], '4th function parameter incorrect').to.equal(context);
        expect(fakeSaveDeviceToDynamo.args[0][4], '5th function parameter incorrect').to.equal(false);
      });
    });

    it('- handles overAllowedAge false', () => {
        //setup
        let record = {
          Item: {
            date: {
              N: Date.now()
            },
            DeviceId: {
              S: 'abc'
            }
          }
        };

        //run
        DeviceTrackingService.manageVerifiedDevice(record, event, context);

        //assert
        expect(event.response.answerCorrect, 'answerCorrect not correct').to.be.true;
        expect(succeed.calledOnce, 'succeed not called').to.be.true;
    });

  });

  describe('- paramsForGetItem Tests', () => {
    it('- sets up params correctly', () => {
      //setup

      //run
      let params = DeviceTrackingService.paramsForGetItem(deviceId, event);

      //assert
      expect(params.TableName, 'tablename incorrect').to.equal(process.env.DYNAMO_TABLENAME);
      expect(params.Key.Username.S, 'username incorrect').to.equal("some_user");
      expect(params.Key.DeviceId.S, 'deviceid incorrect').to.equal("device_id");
    });
  });

  describe('- paramsForStoringTrackedDeviceCounter Tests', () => {
    it('- sets up params correctly', () => {
      //setup
      let time = 1111;

      //run
      let params = DeviceTrackingService.paramsForStoringTrackedDeviceCounter(deviceId, time, event);

      //assert
      expect(params.TableName, 'tablename incorrect').to.equal(process.env.DYNAMO_TABLENAME);
      expect(params.Key.Username.S, 'username incorrect').to.equal("some_user");
      expect(params.Key.DeviceId.S, 'deviceid incorrect').to.equal("device_id");
      expect(params.ExpressionAttributeValues[':d'].N.toString(), 'date incorrect').to.equal(time.toString());
    });
  });

  describe('- paramsForGettingTrackedDevice Tests', () => {
    it('- sets up params correctly', () => {
      //setup

      //run
      let params = DeviceTrackingService.paramsForGettingTrackedDevice(deviceId, event);

      //assert
      expect(params.DeviceKey, 'devicekey incorrect').to.equal(deviceId);
      expect(params.UserPoolId, 'userpoolid incorrect').to.equal('us-east-2_JDIuaVjlq');
      expect(params.Username, 'username incorrect').to.equal(event.userName);
    });
  });

  describe('- overAllowedAge Tests', () => {
    it('- returns true when time between date passed in and now is larger than allowed', () => {
      //setup
      let time = 0;

      //run
      let value = DeviceTrackingService.overAllowedAge(time);

      //assert
      expect(value).to.be.true;
    });

    it('- returns false when time between date passed in and now is within allowed time', () => {
      //setup
      let time = Date.now();

      //run
      let value = DeviceTrackingService.overAllowedAge(time);

      //assert
      expect(value).to.equal.false;
    });
  });

  describe('- saveDeviceToDynamo Tests', () => {
    afterEach(() => {
      AWS.restore('DynamoDB');
    });

    it('- fails on error saving to dynamo', () => {
      //setup
      let time = 0;
      let setResponseAnswerCorrect = false;

      AWS.mock('DynamoDB', 'updateItem', function(params, callback) {
        callback({}, null);
      });

      //run
      DeviceTrackingService.saveDeviceToDynamo(deviceId, time, event, context, setResponseAnswerCorrect);


      //assert
      expect(fail.calledOnce).to.be.true;
    });

    describe('- handles successful save to dynamo and setResponseAnswerCorrect = true', () => {
      it('- handles overAllowedAge true', () => {
        //setup
        let time = 0;
        let setResponseAnswerCorrect = true;
        AWS.mock('DynamoDB', 'updateItem', function(params, callback) {
          callback(null, {});
        });

        //run
        DeviceTrackingService.saveDeviceToDynamo(deviceId, time, event, context, setResponseAnswerCorrect);

        //assert
        expect(succeed.calledOnce, 'succeed not called').to.be.true;
        expect(event.response.answerCorrect, 'answerCorrect not correct').to.be.false;
      });

      it('- handles overAllowedAge false', () => {
        //setup
        let time = Date.now();
        let setResponseAnswerCorrect = true;
        AWS.mock('DynamoDB', 'updateItem', function(params, callback) {
          callback(null, {});
        });

        //run
        DeviceTrackingService.saveDeviceToDynamo(deviceId, time, event, context, setResponseAnswerCorrect);

        //assert
        expect(succeed.calledOnce, 'succeed not called').to.be.true;
        expect(event.response.answerCorrect, 'answer correct not correct').to.be.true;
      });

    });

    describe('- handles successful save to dynamo and setResponseAnswerCorrect = false', () => {
      it('- returns success', () => {
        //setup
        let time = 0;
        let setResponseAnswerCorrect = false;
        AWS.mock('DynamoDB', 'updateItem', function(params, callback) {
          callback(null, {});
        });

        //run
        DeviceTrackingService.saveDeviceToDynamo(deviceId, time, event, context, setResponseAnswerCorrect);

        //assert
        expect(succeed.calledOnce).to.be.true;
      });
    });
  });

  describe('- manageNonVerifiedDevice Tests', () => {
    afterEach(() => {
      AWS.restore('CognitoIdentityServiceProvider');
    });

    describe('- error returned', () => {
      it('- fails on unknown error', () => {
        //setup
        AWS.mock('CognitoIdentityServiceProvider', 'adminGetDevice', function(params, callback) {
          callback({code: 'unknown'}, null);
        });

        //run
        DeviceTrackingService.manageNonVerifiedDevice(deviceId, event, context);


        //assert
        expect(fail.calledOnce, 'fail not called').to.be.true;
        expect(event.response.answerCorrect, 'answer correct not correct').to.be.false;
      });

      it('- succeeds on device not found error', () => {
        //setup
        AWS.mock('CognitoIdentityServiceProvider', 'adminGetDevice', function(params, callback) {
          callback({code: 'ResourceNotFoundException'}, null );
        });

        //run
        DeviceTrackingService.manageNonVerifiedDevice(deviceId, event, context);


        //assert
        expect(succeed.calledOnce, 'succeed not called').to.be.true;
        expect(event.response.answerCorrect, 'answerCorrect not correct').to.be.false;
      });
    });

    describe('- error not returned', () => {
      let fakeSaveToDynamo;
      let stubSaveToDynamo;

      beforeAll(() => {
        fakeSaveToDynamo = sinon.fake();
        stubSaveToDynamo = sinon.stub(DeviceTrackingService, "saveDeviceToDynamo").callsFake(fakeSaveToDynamo);
      });

      afterEach(() => {
        stubSaveToDynamo.reset();
        fakeSaveToDynamo.resetHistory();
      });

      it('- saves to dynamo', () => {
        //setup
        AWS.mock('CognitoIdentityServiceProvider', 'adminGetDevice', function(params, callback) {
          callback(null, {
            Device: {
              DeviceCreateDate: 'Jun 4, 2018 6:36:12 PM'
            }
          });
        });

        //run
        DeviceTrackingService.manageNonVerifiedDevice(deviceId, event, context);

        //assert
        expect(fakeSaveToDynamo.calledOnce, 'saveToDynamo not called').to.be.true;
        expect(fakeSaveToDynamo.args.length, 'number of args incorrect').to.equal(1);
        expect(fakeSaveToDynamo.args[0], 'number of params incorrect').to.have.lengthOf(5);
        expect(fakeSaveToDynamo.args[0][0], '1st function parameter incorrect').to.equal(deviceId);
        expect(fakeSaveToDynamo.args[0][1], '2nd function parameter incorrect').to.equal(Date.parse('Jun 4, 2018 6:36:12 PM'));
        expect(fakeSaveToDynamo.args[0][2], '3rd function parameter incorrect').to.equal(event);
        expect(fakeSaveToDynamo.args[0][3], '4th function parameter incorrect').to.equal(context);
        expect(fakeSaveToDynamo.args[0][4], '5th function parameter incorrect').to.be.true;
      });
    });
  });
});
