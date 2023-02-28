/** @jest-environment jsdom */
/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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

import { cloneDeep } from 'lodash';
import {
  tokenToFormik,
  formikToToken,
  validateName,
  buildUiExpiresAfter,
  buildExpiresAfter,
} from './utils';
import {
  forbiddenCharsText,
  nameAlreadyExistsText,
  problemWithValidationTryAgainText,
} from '../../utils/i18n/common';

describe('CreateAuthToken/utils', () => {
  test('buildExpiresAfter', () => {
    expect(buildExpiresAfter({ value: 24, unit: 'h' })).toBe('24h');
  });

  test('buildUiExpiresAfter', () => {
    const inputs = [
      {
        time_a: 1674403291414,
        time_b: 1611331167099,
        output: { value: 2, unit: 'y' },
      },
      {
        time_a: 1614010453431,
        time_b: 1611331167099,
        output: { value: 1, unit: 'M' },
      },
      {
        time_a: 1611936949223,
        time_b: 1611331167099,
        output: { value: 1, unit: 'w' },
      },
      {
        time_a: 1611591398379,
        time_b: 1611331167099,
        output: { value: 3, unit: 'd' },
      },
      {
        time_a: 1611343052977,
        time_b: 1611331167099,
        output: { value: 3, unit: 'h' },
      },
      {
        time_a: 1611334212519,
        time_b: 1611331167099,
        output: { value: 50, unit: 'm' },
      },
      {
        time_a: 1611332568925,
        time_b: 1611332571024,
        output: { value: 2, unit: 's' },
      },
      {
        time_a: 1611332628015,
        time_b: 1611332628341,
        output: { value: 326, unit: 'ms' },
      },
    ];

    for (const input of inputs) {
      expect(buildUiExpiresAfter(input.time_a, input.time_b)).toEqual(input.output);
    }
  });

  test('formikToToken', () => {
    const formik = {
      user_name: '',
      token_name: 'aToken',
      _name: 'bToken',
      _expires_after: { value: 1, unit: 'y' },
      _isRequestedJSON: true,
      _requested: JSON.stringify(
        {
          index_permissions: [
            {
              index_patterns: ['anIndex'],
              allowed_actions: ['READ_ALL'],
            },
          ],
        },
        null,
        2
      ),
      requested: {
        cluster_permissions: ['CLUSTER_COMPOSITE_OPS_RO', 'CLUSTER_COMPOSITE_OPS'],
        index_permissions: [
          {
            index_patterns: ['*'],
            allowed_actions: ['ACCESS_ALL'],
          },
        ],
        exclude_cluster_permissions: ['cluster:admin:security:authtoken/_own/create'],
      },
      created_at: 1611242380000,
      expires_at: 1611328780000,
      base: { roles_be: ['admin'] },
    };

    const token = {
      name: 'bToken',
      expires_after: '1y',
      requested: {
        index_permissions: [
          {
            index_patterns: ['anIndex'],
            allowed_actions: ['READ_ALL'],
          },
        ],
      },
      created_at: 1611242380000,
      expires_at: 1611328780000,
    };

    expect(formikToToken(formik)).toEqual(token);
  });

  describe('tokenToFormik', () => {
    test('return the default values', () => {
      expect(tokenToFormik()).toEqual({
        _requested: '',
        _name: '',
        _expires_after: { value: 24, unit: 'h' },
        _isRequestedJSON: false,
        _requested: JSON.stringify(
          {
            index_permissions: [
              {
                index_patterns: ['*'],
                allowed_actions: ['*'],
              },
            ],
            tenant_permissions: [
              {
                tenant_patterns: ['*'],
                allowed_actions: ['*'],
              },
            ],
            cluster_permissions: ['*'],
          },
          null,
          2
        ),
      });
    });

    test('token to formik', () => {
      const expiresAt = 1611334825800;
      const token = {
        user_name: 'admin',
        token_name: 'aToken',
        requested: {
          cluster_permissions: ['CLUSTER_COMPOSITE_OPS_RO', 'CLUSTER_COMPOSITE_OPS'],
          index_permissions: [
            {
              index_patterns: ['*'],
              allowed_actions: ['ACCESS_ALL'],
            },
          ],
          exclude_cluster_permissions: ['cluster:admin:security:authtoken/_own/create'],
        },
        base: {
          roles_be: ['admin'],
          config: [
            {
              type: 'ACTIONGROUPS',
              version: 2,
            },
            {
              type: 'ROLES',
              version: 2,
            },
            {
              type: 'TENANTS',
              version: 2,
            },
            {
              type: 'ROLESMAPPING',
              version: 2,
            },
          ],
        },
        created_at: 1611242380000,
        expires_at: expiresAt,
      };

      const formik = {
        ...cloneDeep(token),
        _id: '123',
        _name: token.token_name,
        _expires_after: {
          value: expect.any(Number),
          unit: expect.stringMatching(/(y|M|w|d|h|m|s|ms)/),
        },
        _isRequestedJSON: false,
        _requested: JSON.stringify(token.requested, null, 2),
      };

      expect(tokenToFormik(token, { _id: '123', expires_at: expiresAt })).toEqual(formik);
    });
  });
});
