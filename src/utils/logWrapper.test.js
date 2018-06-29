import {expect} from 'chai';

import logWrapper from './logWrapper';
import sinon from 'sinon';

describe('logWrapper Tests', () => {

  let consoleLogSpy;

  beforeAll(() => {
    consoleLogSpy = sinon.spy(console, "log");
  });

  afterAll(() => {
    consoleLogSpy.restore();
  });

  beforeEach(() => {
    consoleLogSpy.resetHistory();
  });

  it('logs when not in test', () => {
   //setup
   process.env.NODE_ENV = 'not_test';

   //run
   logWrapper.logExceptOnTest("");

   //assert
   expect(consoleLogSpy.called).to.equal(true);
  });

  it('does not log when in test', () => {
    //setup
    process.env.NODE_ENV = 'test';

    //run
    logWrapper.logExceptOnTest("foobar");

    //assert
    expect(consoleLogSpy.called).to.equal(false);
  });
});
