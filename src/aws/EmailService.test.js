import {expect} from 'chai';
import sinon from 'sinon';

var AWS = require('aws-sdk-mock');
import EmailService from './EmailService';

process.env.NODE_ENV = 'test';
process.env.SES_REGION = 'us-west-2';
process.env.SOURCE_EMAIL = 'abc@test.com'

describe('EmailService.js Tests', () => {
  let succeed;
  let fail;
  let context;
  let fakeSesSendMail;


  beforeAll(() => {
    fakeSesSendMail = sinon.fake();

    succeed = sinon.fake();
    fail = sinon.fake();

    context = Object.assign({}, {succeed: succeed, fail: fail});
  });

  afterEach(() => {
    AWS.restore('SES');
    succeed.resetHistory();
    fail.resetHistory();
    fakeSesSendMail.resetHistory();
  });

  it('calls ses send email correctly', () => {
    //setup
    let token = '123456789';
    let email = 'john.doe@domain.com';
    AWS.mock('SES', 'sendEmail', fakeSesSendMail);

    //run
    EmailService.sendEmail(email, token, {}, context);


    //assert
    expect(fakeSesSendMail.calledOnce).to.equal(true);
    expect(fakeSesSendMail.args.length).to.equal(1);
    expect(fakeSesSendMail.args[0].length).to.equal(2);
    let params = fakeSesSendMail.args[0][0];
    expect(params.Destination.ToAddresses.length).to.equal(1);
    expect(params.Destination.ToAddresses[0]).to.equal(email);
    expect(params.Message.Body.Text.Data).to.include(token);
    expect(params.Source).to.equal('abc@test.com');
  });

  it('sets failure on error sending email', () => {
    //setup
    let token = '123456789';
    let email = 'john.doe@domain.com';
    AWS.mock('SES', 'sendEmail', function(params, callback) {
      callback({}, null);
    });

    //run
    EmailService.sendEmail(email, token, {}, context);

    //assert
    expect(fail.calledOnce).to.equal(true);
  });

  it('sets success on successful sending email', () => {
    //setup
    let token = '123456789';
    let email = 'john.doe@domain.com';
    AWS.mock('SES', 'sendEmail', function(params, callback) {
      callback(null, {});
    });

    //run
    EmailService.sendEmail(email, token, {}, context);

    //assert
    expect(succeed.calledOnce).to.equal(true);
  });
});


