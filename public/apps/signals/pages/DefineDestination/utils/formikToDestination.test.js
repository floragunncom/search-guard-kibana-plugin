import {
  buildEmailDestination,
  formikToDestination
} from './formikToDestination';
import { DESTINATION_TYPE } from '../../Destinations/utils/constants';

describe('formikToDestination', () => {
  test('can build email destiantion', () => {
    expect(formikToDestination({
      type: DESTINATION_TYPE.EMAIL
    })).toEqual({
      type: DESTINATION_TYPE.EMAIL
    });
  });

  test('can build slack destiantion', () => {
    expect(formikToDestination({
      type: DESTINATION_TYPE.SLACK
    })).toEqual({
      type: DESTINATION_TYPE.SLACK
    });
  });
});

describe('buildEmailDestination', () => {
  test('can build destination', () => {
    expect(buildEmailDestination({
      type: DESTINATION_TYPE.EMAIL,
      default_to: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      default_cc: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      default_bcc: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      trusted_hosts: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
    })).toEqual({
      type: DESTINATION_TYPE.EMAIL,
      default_to: ['b@mail.com', 'c@mail.com'],
      default_cc: ['b@mail.com', 'c@mail.com'],
      default_bcc: ['b@mail.com', 'c@mail.com'],
      trusted_hosts: ['b@mail.com', 'c@mail.com'],
    });
  });
});
