import {
  buildFormikEmailDestination,
  destinationToFormik
} from './destinationToFormik';
import { DESTINATION_TYPE } from '../../Destinations/utils/constants';
import * as DEFAULTS from './defaults';

describe('destinationToFormik', () => {
  test('can switch to email formik', () => {
    const formik = destinationToFormik({
      type: DESTINATION_TYPE.EMAIL
    });

    expect(formik.type).toBe(DESTINATION_TYPE.EMAIL);
  });

  test('can switch to slack formik', () => {
    const formik = destinationToFormik({
      type: DESTINATION_TYPE.SLACK
    });

    expect(formik.type).toBe(DESTINATION_TYPE.SLACK);
  });
});

describe('buildFormikEmailDestination', () => {
  test('can build formik', () => {
    expect(buildFormikEmailDestination({
      type: DESTINATION_TYPE.EMAIL,
      default_to: ['b@mail.com', 'c@mail.com'],
      default_cc: ['b@mail.com', 'c@mail.com'],
      default_bcc: ['b@mail.com', 'c@mail.com'],
      trusted_hosts: ['b@mail.com', 'c@mail.com']
    })).toEqual({
      ...DEFAULTS[DESTINATION_TYPE.EMAIL],
      default_to: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      default_cc: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      default_bcc: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      trusted_hosts: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }]
    });
  });
});
