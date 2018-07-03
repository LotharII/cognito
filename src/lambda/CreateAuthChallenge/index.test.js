import {expect} from 'chai';

import CreateAuthChallenge from './index';
import EmailService from '../../aws/EmailService';
import sinon from 'sinon';


process.env.NODE_ENV = 'test';

describe('CreateAuthChallenge Tests', () => {
  let succeed;
  let fail;
  let context;
  let sendEmailFake;
  let sendEmailStub;


  beforeAll(() => {
    succeed = sinon.fake();
    fail = sinon.fake();
    context = Object.assign({}, baseContext, {succeed: succeed, fail: fail});

    sendEmailFake = sinon.fake();
    sendEmailStub = sinon.stub(EmailService, "sendEmail").callsFake(sendEmailFake);
  });

  beforeEach(() => {
    succeed.resetHistory();
    fail.resetHistory();
    sendEmailFake.resetHistory();
  });

  afterAll(() => {
    sendEmailStub.restore();
  });

  describe('- Device Challenge', () => {
    it('sets up device challenge correctly', () => {
      //setup
      let testSession = [srpaSession, passwordVerifierSession];
      let testRequest = Object.assign({}, baseRequest, {session: testSession});
      let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: {}});

      //run
      CreateAuthChallenge.handler(testEvent, context);

      //assert
      expect(testEvent.response.privateChallengeParameters.challenge).to.equal('DEVICE_CHALLENGE');
      expect(testEvent.response.challengeMetadata).to.not.equal(null);
      expect(testEvent.response.privateChallengeParameters.uniqueId).to.not.equal(null);
      expect(testEvent.response.challengeMetadata === testEvent.response.privateChallengeParameters.uniqueId).to.equal(true);
      expect(succeed.calledOnce).to.equals(true);
    });
  });

  describe('- OTP Challenge', () => {
    it('sets up otp challenge metadata correctly', () => {
      //setup
      let testSession = [srpaSession, passwordVerifierSession, customChallengeSession];
      let testRequest = Object.assign({}, baseRequest, {session: testSession});
      let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: {}});

      //run
      CreateAuthChallenge.handler(testEvent, context);

      //assert
      expect(testEvent.response.challengeMetadata).to.equal('OTP_CHALLENGE');
    });

    it('calls send email', () => {
      //setup
      let testSession = [srpaSession, passwordVerifierSession, customChallengeSession];
      let testRequest = Object.assign({}, baseRequest, {session: testSession});
      let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: {}});

      //run
      CreateAuthChallenge.handler(testEvent, context);

      //assert
      expect(sendEmailFake.calledOnce, 'track called').to.be.true;
      expect(sendEmailFake.args, 'args incorrect size').to.have.lengthOf(1);
      expect(sendEmailFake.args[0], 'function params incorrect size').to.have.lengthOf(4);
      expect(sendEmailFake.args[0][0], '1st function parameter incorrect').to.equal('john.doe@domain.com');
      expect(sendEmailFake.args[0][1], '2nd function parameter incorrect').is.not.null;
      expect(sendEmailFake.args[0][2], '3rd function parameter incorrect').to.equal(testEvent);
      expect(sendEmailFake.args[0][3], '4th function parameter incorrect').to.equal(context);
    });
  });
});

const srpaSession = {
  challengeName: 'SRP_A',
  challengeResult: true,
  challengeMetadata: null
};

const passwordVerifierSession = {
  challengeName: 'PASSWORD_VERIFIER',
  challengeResult: true,
  challengeMetadata: null
};

const customChallengeSession = {
  "challengeName": "CUSTOM_CHALLENGE",
  "challengeResult": false,
  "challengeMetadata": "UNIQUE-KEY-8eou58906rckwsfko6r"
}

const baseEvent = {
  "version":"1",
  "region":"us-east-2",
  "userPoolId":"us-east-2_JDIuaVjlq",
  "userName":"ab3solutions+BKQA11@gmail.com",
  "callerContext":{
     "awsSdkVersion":"aws-sdk-unknown-unknown",
     "clientId":"7ub8kdb6eaeiul3a07h27g4dfu"
  },
  "triggerSource":"CreateAuthChallenge_Authentication",
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
     "email":"john.doe@domain.com"
  },
  "challengeName": "CUSTOM_CHALLENGE",
  "session":null
};

const baseContext = {
  "callbackWaitsForEmptyEventLoop": true,
  "logGroupName": "/aws/lambda/CreateAuthChallenge",
  "logStreamName": "2018/06/03/[$LATEST]a4eef560d82b4322aa62102b4d72fce8",
  "functionName": "CreateAuthChallenge",
  "memoryLimitInMB": "128",
  "functionVersion": "$LATEST",
  "invokeid": "3cc92efd-675c-11e8-a312-1929aa192a33",
  "awsRequestId": "3cc92efd-675c-11e8-a312-1929aa192a33",
  "invokedFunctionArn": "arn:aws:lambda:us-east-2:142152461930:function:CreateAuthChallenge",
  "done": null,
  "succeed":null,
  "fail": null,
};


