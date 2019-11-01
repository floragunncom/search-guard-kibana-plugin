import {
  buildEmailAccount,
  formikToAccount
} from './formikToAccount';
import { ACCOUNT_TYPE } from '../../Accounts/utils/constants';

describe('formikToAccount', () => {
  test('can build email destiantion', () => {
    expect(formikToAccount({
      type: ACCOUNT_TYPE.EMAIL
    })).toEqual({
      type: ACCOUNT_TYPE.EMAIL
    });
  });

  test('can build slack destiantion', () => {
    expect(formikToAccount({
      type: ACCOUNT_TYPE.SLACK
    })).toEqual({
      type: ACCOUNT_TYPE.SLACK
    });
  });
});

describe('buildEmailAccount', () => {
  test('can build account', () => {
    expect(buildEmailAccount({
      type: ACCOUNT_TYPE.EMAIL,
      default_to: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      default_cc: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      default_bcc: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      trusted_hosts: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
    })).toEqual({
      type: ACCOUNT_TYPE.EMAIL,
      default_to: ['b@mail.com', 'c@mail.com'],
      default_cc: ['b@mail.com', 'c@mail.com'],
      default_bcc: ['b@mail.com', 'c@mail.com'],
      trusted_hosts: ['b@mail.com', 'c@mail.com'],
    });
  });
});
