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

import {
  validateESDLSQuery,
  validatePassword,
  validateEmptyComboBox,
  validClusterSinglePermissionOption,
  validSinglePermissionOption,
  validIndicesSinglePermissionOption,
  validateName,
} from './validation';
import {
  jsonIsInvalidText,
  requiredText,
  problemWithValidationTryAgainText,
  indicesPermissionsPrefixErrorText,
  clusterPermissionsPrefixErrorText,
  permissionsPrefixErrorText,
  forbiddenCharsText,
} from './i18n/common';
import { dlsQuerySyntaxIsInvalidText } from './i18n/roles';
import { passwordsDontMatchText } from './i18n/internal_users';

describe('validation', () => {
  describe('Internal User validation', () => {
    test('can validate password equals passwordConfirmation', () => {
      const password = '12345';
      const passwordConfirmation = '12345';
      expect(validatePassword(passwordConfirmation)(password)).toEqual(undefined);
    });

    test('fail to validate due to password != passwordConfirmation', () => {
      const password = '12345678';
      const passwordConfirmation = '12345';
      expect(validatePassword(passwordConfirmation)(password)).toEqual(passwordsDontMatchText);
    });

    test('fail to validate due to password not set', () => {
      const password = '';
      expect(validatePassword(password)(password)).toEqual(requiredText);
    });
  });

  describe('DLS Query', () => {
    test('can validate DLS Query', async () => {
      const query = JSON.stringify({ match: { a: 'b' } });
      const index = 'index';
      class HttpClient {
        static post() {
          return { data: { valid: true } };
        }
      }

      await expect(validateESDLSQuery(index, HttpClient)(query)).resolves.toEqual(undefined);
    });

    test('can validate empty DLS Query (no DLS is used)', async () => {
      const query = '';
      const index = 'index';
      class HttpClient {}

      await expect(validateESDLSQuery(index, HttpClient)(query)).resolves.toEqual(undefined);
    });

    test('fail to validate DLS Query due to wrong syntax', async () => {
      const query = JSON.stringify({ matchesssssss: { a: 'b' } });
      const index = 'index';
      class HttpClient {
        static post() {
          return { data: { valid: false } };
        }
      }

      await expect(validateESDLSQuery(index, HttpClient)(query)).resolves.toEqual(
        dlsQuerySyntaxIsInvalidText
      );
    });

    test('fail to validate DLS Query due to wrong JSON', async () => {
      const query = '{"a"}';
      const index = 'index';
      class HttpClient {}

      await expect(validateESDLSQuery(index, HttpClient)(query)).resolves.toEqual(
        jsonIsInvalidText
      );
    });

    test('fail to validate due to the failed async call', async () => {
      const query = '{"a": "b"}';
      const index = 'index';
      class HttpClient {
        static post() {
          return Promise.reject('async call failed');
        }
      }

      await expect(validateESDLSQuery(index, HttpClient)(query)).resolves.toEqual(
        problemWithValidationTryAgainText
      );
    });
  });

  describe('validate empty ComboBox', () => {
    test('can validate ComboBox', () => {
      expect(validateEmptyComboBox([{ label: 'a' }])).toEqual(undefined);
    });

    test('fail to validate because ComboBox is not allowed to be empty', () => {
      expect(validateEmptyComboBox([])).toEqual(requiredText);
    });
  });

  describe('validate single permissions', () => {
    test('can validate cluster and indices permission', () => {
      expect(validClusterSinglePermissionOption([{ label: 'cluster:*' }])).toEqual(null);
      expect(validClusterSinglePermissionOption([{ label: 'cluster:a' }])).toEqual(null);
      expect(validClusterSinglePermissionOption([{ label: 'cluster:a/b/c' }])).toEqual(null);
      expect(validIndicesSinglePermissionOption([{ label: 'indices:*' }])).toEqual(null);
      expect(validIndicesSinglePermissionOption([{ label: 'indices:a' }])).toEqual(null);
      expect(validIndicesSinglePermissionOption([{ label: 'indices:a/b/c' }])).toEqual(null);
    });

    test('fail to validate cluster and indices permissions', () => {
      expect(validClusterSinglePermissionOption([{ label: 'cluster:' }])).toEqual(
        clusterPermissionsPrefixErrorText
      );
      expect(validClusterSinglePermissionOption([{ label: 'cat' }])).toEqual(
        clusterPermissionsPrefixErrorText
      );
      expect(validClusterSinglePermissionOption([{ label: 'indices:a/b/c' }])).toEqual(
        clusterPermissionsPrefixErrorText
      );
      expect(validIndicesSinglePermissionOption([{ label: 'indices:' }])).toEqual(
        indicesPermissionsPrefixErrorText
      );
      expect(validIndicesSinglePermissionOption([{ label: 'cat' }])).toEqual(
        indicesPermissionsPrefixErrorText
      );
      expect(validIndicesSinglePermissionOption([{ label: 'cluster:a/b/c' }])).toEqual(
        indicesPermissionsPrefixErrorText
      );
    });

    test('can validate single permission', () => {
      expect(validSinglePermissionOption([{ label: 'cluster:*' }])).toEqual(null);
      expect(validSinglePermissionOption([{ label: 'cluster:a' }])).toEqual(null);
      expect(validSinglePermissionOption([{ label: 'cluster:a/b/c' }])).toEqual(null);
      expect(validSinglePermissionOption([{ label: 'indices:*' }])).toEqual(null);
      expect(validSinglePermissionOption([{ label: 'indices:a' }])).toEqual(null);
      expect(validSinglePermissionOption([{ label: 'indices:a/b/c' }])).toEqual(null);
    });

    test('fail to validate single permission', () => {
      expect(validSinglePermissionOption([{ label: 'cluster:' }])).toEqual(
        permissionsPrefixErrorText
      );
      expect(validSinglePermissionOption([{ label: 'indices:' }])).toEqual(
        permissionsPrefixErrorText
      );
      expect(validSinglePermissionOption([{ label: 'cat' }])).toEqual(permissionsPrefixErrorText);
    });
  });

  describe('validateName', () => {
    test('forbidden chars', async () => {
      const Service = jest.fn();
      const expected = forbiddenCharsText;
      const inputs = [
        {
          input: 'abc.',
          expected,
        },
        {
          input: 'abc*',
          expected,
        },
      ];

      for (let i = 0; i < inputs.length; i++) {
        const { input, expected } = inputs[i];
        expect(await validateName(Service)(input)).toBe(expected);
      }
    });

    test('allowed chars', async () => {
      const expected = null;
      const inputs = [
        {
          input: 'abc#',
          expected,
        },
        {
          input: 'abc&',
          expected,
        },
        {
          input: 'abc+',
          expected,
        },
        {
          input: 'abc/',
          expected,
        },
        {
          input: 'abc\\',
          expected,
        },
        {
          input: 'abc1',
          expected,
        },
        {
          input: 'abc d',
          expected,
        },
        {
          input: 'abc',
          expected,
        },
        {
          input: 'abc_',
          expected,
        },
        {
          input: 'abc-',
          expected,
        },
        {
          input: 'abc!',
          expected,
        },
        {
          input: 'abc~',
          expected,
        },
        {
          input: 'abc(',
          expected,
        },
        {
          input: 'abc)',
          expected,
        },
        {
          input: 'abc',
          expected,
        },
        {
          input: 'abc;',
          expected,
        },
        {
          input: 'abc?,',
          expected,
        },
        {
          input: 'abc:',
          expected,
        },
        {
          input: 'abc@',
          expected,
        },
        {
          input: 'abc=',
          expected,
        },
        {
          input: 'abc$',
          expected,
        },
        {
          input: 'abc}',
          expected,
        },
        {
          input: 'abc]',
          expected,
        },
      ];

      for (let i = 0; i < inputs.length; i++) {
        const { input, expected } = inputs[i];
        const Service = { list: jest.fn().mockResolvedValue({ data: { [input]: {} } }) };
        expect(await validateName(Service)(input)).toBe(expected);
      }
    });
  });
});
