/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { buildFormikEmailAccount, accountToFormik } from './accountToFormik';
import { ACCOUNT_TYPE } from '../../Accounts/utils/constants';
import * as DEFAULTS from './defaults';

describe('accountToFormik', () => {
  test('can switch to email formik', () => {
    const formik = accountToFormik({
      type: ACCOUNT_TYPE.EMAIL,
    });

    expect(formik.type).toBe(ACCOUNT_TYPE.EMAIL);
  });

  test('can switch to slack formik', () => {
    const formik = accountToFormik({
      type: ACCOUNT_TYPE.SLACK,
    });

    expect(formik.type).toBe(ACCOUNT_TYPE.SLACK);
  });
});

describe('buildFormikEmailAccount', () => {
  test('can build formik', () => {
    expect(
      buildFormikEmailAccount({
        type: ACCOUNT_TYPE.EMAIL,
        default_to: ['b@mail.com', 'c@mail.com'],
        default_cc: ['b@mail.com', 'c@mail.com'],
        default_bcc: ['b@mail.com', 'c@mail.com'],
        trusted_hosts: ['b@mail.com', 'c@mail.com'],
      })
    ).toEqual({
      ...DEFAULTS[ACCOUNT_TYPE.EMAIL],
      default_to: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      default_cc: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      default_bcc: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
      trusted_hosts: [{ label: 'b@mail.com' }, { label: 'c@mail.com' }],
    });
  });
});
