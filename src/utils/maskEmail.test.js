import {expect} from 'chai';

import maskEmail from './maskEmail';

describe('maskEmail Tests', () => {

  it('masks correctly', () => {
   //setup
   let email = 'foo@test.com';

   //run
   let result = maskEmail.mask(email);

   //assert
   expect(result).to.equal('f*o@test.com');
  });

  it('masks correctly again', () => {
    //setup
    let email = 'abcdefghij123@test.com';
 
    //run
    let result = maskEmail.mask(email);
 
    //assert
    expect(result).to.equal('a***********3@test.com');
   });
});
