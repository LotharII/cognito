import {expect} from 'chai';

import VerifyAuthChallenge from './index';
import DeviceTrackingService from '../../aws/DeviceTrackingService';
import sinon from 'sinon';

process.env.NODE_ENV = 'test';

describe('VerifyAuthChallenge Tests', () => {
  let done;
  let succeed;
  let fail;
  let track;
  let stubTrack;
  let context;

  before(() => {
    done = sinon.fake();
    succeed = sinon.fake();
    fail = sinon.fake();
    track = sinon.fake();
    stubTrack = sinon.stub(DeviceTrackingService, "track").callsFake(track);
    context = Object.assign({}, baseContext, {done: done, succeed: succeed, fail: fail})
  });


  beforeEach(() => {
    done.resetHistory();
    succeed.resetHistory();
    fail.resetHistory();
    track.resetHistory();
  });

  after(() => {
    stubTrack.restore();
  });

  describe('Verify Device Challenge Tests', () => {
    describe('- DEVICE_CHALLENGE tests', () => {
      it('- fails challenge when no device id sent from client', () => {
        //setup
        let privateChallengeParameters = {
          challenge: 'DEVICE_CHALLENGE',
          uniqueId: 'UNIQUE-KEY-12345'
        };
        let testRequest = Object.assign({}, baseRequest, {privateChallengeParameters: privateChallengeParameters, challengeAnswer: "null"});
        let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

        //run
        VerifyAuthChallenge.handler(testEvent, context)

        //assert
        expect(testEvent.response.answerCorrect, 'answerCorrect should  be false').to.be.false;
        expect(succeed.calledOnce, 'succeed should have been called').to.equal(true);
      });

      it('- deviceTrackingService.track called when device id sent from client', () => {
        //setup
        let privateChallengeParameters = {
          challenge: 'DEVICE_CHALLENGE',
          uniqueId: 'UNIQUE-KEY-12345'
        };
        let testRequest = Object.assign({}, baseRequest, {privateChallengeParameters: privateChallengeParameters, challengeAnswer: "12345"});
        let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

        //run
        VerifyAuthChallenge.handler(testEvent, context)

        //assert
        expect(track.calledOnce, 'track called').to.be.true;
        expect(track.args, 'args incorrect size').to.have.lengthOf(1);
        expect(track.args[0], 'function params incorrect size').to.have.lengthOf(4);
        expect(track.args[0][0], '1st function parameter incorrect').to.equal('12345');
        expect(track.args[0][1], '2nd function parameter incorrect').to.equal(testEvent);
        expect(track.args[0][2], '3rd function parameter incorrect').to.equal(context);
        expect(track.args[0][3], '4th function parameter incorrect').to.equal('DEVICE_CHALLENGE');
      });
    });

    describe('- OTP_CHALLENGE tests', () => {
      it('- handles wrong answer', () => {
        //setup
        let privateChallengeParameters = {
          challenge: 'OTP_CHALLENGE',
          token: 'expected_answer'
        };
        let testRequest = Object.assign({}, baseRequest, {privateChallengeParameters: privateChallengeParameters, challengeAnswer: "wrong_answer"});
        let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

        //run
        VerifyAuthChallenge.handler(testEvent, context)

        //assert
        expect(done.calledOnce, 'done was not called').to.be.true;
        expect(testEvent.response.answerCorrect, 'answerCorrect should be false').to.be.false;
      });

      describe('- correct answer', () => {
        it('- deviceTrackingService.track called if device passed in', () => {
          //setup
          let privateChallengeParameters = {
            challenge: 'OTP_CHALLENGE',
            answer: 'expected_answer'
          };

          let testRequest = Object.assign({}, baseRequest, {privateChallengeParameters: privateChallengeParameters, challengeAnswer: "expected_answer 1234"});
          let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

          //run
          VerifyAuthChallenge.handler(testEvent, context)

          //assert
          expect(track.calledOnce, 'track called').to.be.true;
          expect(track.args, 'args incorrect size').to.have.lengthOf(1);
          expect(track.args[0], 'function params incorrect size').to.have.lengthOf(4);
          expect(track.args[0][0], '1st function parameter incorrect').to.equal('1234');
          expect(track.args[0][1], '2nd function parameter incorrect').to.equal(testEvent);
          expect(track.args[0][2], '3rd function parameter incorrect').to.equal(context);
          expect(track.args[0][3], '4th function parameter incorrect').to.equal('OTP_CHALLENGE');
        });

        describe('- no device id passed in', () => {
          it('- id is null', () => {
            //setup
            let privateChallengeParameters = {
             challenge: 'OTP_CHALLENGE',
             answer: 'expected_answer'
             };

             let testRequest = Object.assign({}, baseRequest, {privateChallengeParameters: privateChallengeParameters, challengeAnswer: "expected_answer"});
             let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

             //run
             VerifyAuthChallenge.handler(testEvent, context)

             //assert
             expect(succeed.calledOnce).to.be.true;
           });
           it('- id is \'null\'', () => {
            //setup
            let privateChallengeParameters = {
             challenge: 'OTP_CHALLENGE',
             answer: 'expected_answer'
             };

             let testRequest = Object.assign({}, baseRequest, {privateChallengeParameters: privateChallengeParameters, challengeAnswer: "expected_answer null"});
             let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

             //run
             VerifyAuthChallenge.handler(testEvent, context)

             //assert
             expect(succeed.calledOnce).to.be.true;
           });

           it('- id is \'undefined\'', () => {
            //setup
            let privateChallengeParameters = {
             challenge: 'OTP_CHALLENGE',
             answer: 'expected_answer'
             };

             let testRequest = Object.assign({}, baseRequest, {privateChallengeParameters: privateChallengeParameters, challengeAnswer: "expected_answer undefined"});
             let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

             //run
             VerifyAuthChallenge.handler(testEvent, context)

             //assert
             expect(succeed.calledOnce).to.be.true;
           });


        });
      });
    });

    describe('- unknown challenge tests', () => {
      it('- fails when unknown challenge', () => {
        //setup
        let privateChallengeParameters = {
          challenge: 'UNKNOWN_CHALLENGE',
          uniqueId: 'UNIQUE-KEY-12345'
        };
        let testRequest = Object.assign({}, baseRequest, {privateChallengeParameters: privateChallengeParameters, challengeAnswer: "null"});
        let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

        //run
        VerifyAuthChallenge.handler(testEvent, context)

        //assert
        expect(fail.calledOnce, 'fail should have been called').to.equal(true);
      });
    });
  });
});

const baseResponse = {
  "answerCorrect":null
};

const baseEvent = {
  "version":"1",
  "region":"us-east-2",
  "userPoolId":"us-east-2_JDIuaVjlq",
  "userName":"john.doe@domain.com",
  "callerContext":{
     "awsSdkVersion":"aws-sdk-unknown-unknown",
     "clientId":"sdfdfdfzdbfagrhsfsfg"
  },
  "triggerSource":"VerifyAuthChallengeResponse_Authentication",
  "request":null,
  "response":null
};

const baseRequest = {
  "userAttributes":{
     "sub":"9111f761-cfc2-4949-b25f-ee1edc1539f1",
     "zoneinfo":"External CALS:Cares Snapshot:intake-core-county",
     "email_verified":"True",
     "cognito:user_status":"CONFIRMED",
     "cognito:mfa_enabled":"true",
     "phone_number":"+19161111111",
     "preferred_username":"Yolo",
     "given_name":"Rich",
     "family_name":"Bach",
     "email":"ab3solutions+BKQA11@gmail.com"
  },
  "privateChallengeParameters":{},
  "challengeAnswer":null
};

const baseContext = {
  "callbackWaitsForEmptyEventLoop":[
     {}
  ],
  "done": null,
  "succeed":null,
  "fail": null,
  "logGroupName":"some_log_group_name",
  "logStreamName":"",
  "functionName":"some_function_name",
  "memoryLimitInMB":"128",
  "functionVersion":"$LATEST",
  "getRemainingTimeInMillis":[
     null
  ],
  "invokeid":"fb8501a6-65f9-11e8-9028-0f2cd988d822",
  "awsRequestId":"fb8501a6-65f9-11e8-9028-0f2cd988d822",
  "invokedFunctionArn":"VerifyAuthChallenge"
};
