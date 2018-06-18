import {expect} from 'chai';

import DefineAuthChallenge from './index';
import sinon from 'sinon';


describe('DefineCustomAuth Tests', () => {
  let done;
  let context;

  before(() => {
    done = sinon.fake();
    context = Object.assign({}, baseContext, {done: done})
  });

  beforeEach(() => {
    done.resetHistory();
  });

  it('should fail authentication if empty session', () => {
    //setup
    let testEvent = Object.assign({}, baseEvent, {request: baseRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals(null);
    expect(testEvent.response.issueTokens).to.equals(false);
    expect(testEvent.response.failAuthentication).to.equals(true);
    expect(done.calledOnce).to.equals(true);
  });

  it('should request password verifier if successful srp_a', () => {
    //setup
    let testSession = [Object.assign({}, baseSession, {challengeName: 'SRP_A', challengeResult: true})];
    let testRequest = Object.assign({}, baseRequest, {session: testSession});
    let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals('PASSWORD_VERIFIER');
    expect(testEvent.response.issueTokens).to.equals(false);
    expect(testEvent.response.failAuthentication).to.equals(false);
    expect(done.calledOnce).to.equals(true);
  });

  it('should fail auth if unsuccessful srp_a', () => {
    //setup
    let testSession = [Object.assign({}, baseSession, {challengeName: 'SRP_A', challengeResult: false})];
    let testRequest = Object.assign({}, baseRequest, {session: testSession});
    let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals(null);
    expect(testEvent.response.issueTokens).to.equals(false);
    expect(testEvent.response.failAuthentication).to.equals(true);
    expect(done.calledOnce).to.equals(true);
  });

  it('should request CUSTOM_CHALLENGE if successful PASSWORD VERIFIER', () => {
    //setup
    let testSession = [baseSession, Object.assign({}, baseSession, {challengeName: 'PASSWORD_VERIFIER', challengeResult: true})];
    let testRequest = Object.assign({}, baseRequest, {session: testSession});
    let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals('CUSTOM_CHALLENGE');
    expect(testEvent.response.issueTokens).to.equals(false);
    expect(testEvent.response.failAuthentication).to.equals(false);
    expect(done.calledOnce).to.equals(true);
  });

  it('should fail auth if unsuccessful PASSWORD VERIFIER', () => {
    //setup
    let testSession = [baseSession, Object.assign({}, baseSession, {challengeName: 'PASSWORD_VERIFIER', challengeResult: false})];
    let testRequest = Object.assign({}, baseRequest, {session: testSession});
    let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals(null);
    expect(testEvent.response.issueTokens).to.equals(false);
    expect(testEvent.response.failAuthentication).to.equals(true);
    expect(done.calledOnce).to.equals(true);
  });

  it('should request next CUSTOM_CHALLENGE if unsuccessful previous CUSTOM_CHALLENGE', () => {  //this means the device challange failed - device not verified
    //setup
    let testSession = [baseSession, baseSession, Object.assign({}, baseSession, {challengeName: 'CUSTOM_CHALLENGE', challengeResult: false})];
    let testRequest = Object.assign({}, baseRequest, {session: testSession});
    let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals('CUSTOM_CHALLENGE');
    expect(testEvent.response.issueTokens).to.equals(false);
    expect(testEvent.response.failAuthentication).to.equals(false);
    expect(done.calledOnce).to.equals(true);
  });

  it('should authenticate successful previous CUSTOM_CHALLENGE', () => {  //this means device challenge passed - device was verified
    //setup
    let testSession = [baseSession, baseSession, Object.assign({}, baseSession, {challengeName: 'CUSTOM_CHALLENGE', challengeResult: true})];
    let testRequest = Object.assign({}, baseRequest, {session: testSession});
    let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals(null);
    expect(testEvent.response.issueTokens).to.equals(true);
    expect(testEvent.response.failAuthentication).to.equals(false);
    expect(done.calledOnce).to.equals(true);
  });

  it('should authenticate if successful one time password check', () => {
    //setup
    let testSession = [baseSession, baseSession, baseSession, Object.assign({}, baseSession, {challengeName: 'CUSTOM_CHALLENGE', challengeResult: true})];
    let testRequest = Object.assign({}, baseRequest, {session: testSession});
    let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals(null);
    expect(testEvent.response.issueTokens).to.equals(true);
    expect(testEvent.response.failAuthentication).to.equals(false);
    expect(done.calledOnce).to.equals(true);
  });

  it('should fail auth if unsuccessful one time password check', () => {
    //setup
    let testSession = [baseSession, baseSession, baseSession, Object.assign({}, baseSession, {challengeName: 'CUSTOM_CHALLENGE', challengeResult: false})];
    let testRequest = Object.assign({}, baseRequest, {session: testSession});
    let testEvent = Object.assign({}, baseEvent, {request: testRequest, response: Object.assign({}, baseResponse)});

    //run
    DefineAuthChallenge.handler(testEvent, context);

    //assert
    expect(testEvent.response.challengeName).to.equals(null);
    expect(testEvent.response.issueTokens).to.equals(false);
    expect(testEvent.response.failAuthentication).to.equals(true);
    expect(done.calledOnce).to.equals(true);
  });
});

const baseResponse = {
  "challengeName":null,
  "issueTokens":null,
  "failAuthentication":null
};

const baseSession = {
  challengeName: 'some_challenge',
  challengeResult: true,
  challengeMetadata: null
};

const baseEvent = {
  "version":"1",
  "region":"us-east-2",
  "userPoolId":"us-east-2_JDIuaVjlq",
  "userName":"ab3solutions+BKQA11@gmail.com",
  "callerContext":{
     "awsSdkVersion":"aws-sdk-unknown-unknown",
     "clientId":"7ub8kdb6eaeiul3a07h27g4dfu"
  },
  "triggerSource":"DefineAuthChallenge_Authentication",
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
  "session":null
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
  "invokedFunctionArn":""
};

