import {
  validateESDLSQuery,
  validatePassword,
  validateEmptyComboBox,
  validClusterSinglePermissionOption,
  validSinglePermissionOption
} from './validation';
import {
  jsonIsInvalidText,
  requiredText,
  problemWithValidationTryAgainText
} from './i18n/common';
import { dlsQuerySyntaxIsInvalidText } from './i18n/roles';
import {
  passwordsDontMatchText,
  passwordMustBeAtLeast5CharsText
} from './i18n/internal_users';

describe('validation', () => {

  describe('Internal User validation', () => {
    test('can validate password equals passwordConfirmation', () => {
      const password = '12345';
      const passwordConfirmation = '12345';
      expect(
        validatePassword(passwordConfirmation)(password)
      ).toEqual(undefined);
    });

    test('fail to validate due to password != passwordConfirmation', () => {
      const password = '12345678';
      const passwordConfirmation = '12345';
      expect(
        validatePassword(passwordConfirmation)(password)
      ).toEqual(passwordsDontMatchText);
    });

    test('fail to validate due to password not set', () => {
      const password = '';
      expect(
        validatePassword(password)(password)
      ).toEqual(requiredText);
    });

    test('fail to validate due to password too short', () => {
      const password = 'abcd';
      expect(
        validatePassword(password)(password)
      ).toEqual(passwordMustBeAtLeast5CharsText);
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

      await expect(
        validateESDLSQuery(index, HttpClient)(query)
      ).resolves.toEqual(undefined);
    });

    test('can validate empty DLS Query (no DLS is used)', async () => {
      const query = '';
      const index = 'index';
      class HttpClient {}

      await expect(
        validateESDLSQuery(index, HttpClient)(query)
      ).resolves.toEqual(undefined);
    });

    test('fail to validate DLS Query due to wrong syntax', async () => {
      const query = JSON.stringify({ matchesssssss: { a: 'b' } });
      const index = 'index';
      class HttpClient {
        static post() {
          return { data: { valid: false } };
        }
      }

      await expect(
        validateESDLSQuery(index, HttpClient)(query)
      ).resolves.toEqual(dlsQuerySyntaxIsInvalidText);
    });

    test('fail to validate DLS Query due to wrong JSON', async () => {
      const query = '{"a"}';
      const index = 'index';
      class HttpClient {}

      await expect(
        validateESDLSQuery(index, HttpClient)(query)
      ).resolves.toEqual(jsonIsInvalidText);
    });

    test('fail to validate due to the failed async call', async () => {
      const query = '{"a": "b"}';
      const index = 'index';
      class HttpClient {
        static post() {
          return Promise.reject('async call failed');
        }
      }

      await expect(
        validateESDLSQuery(index, HttpClient)(query)
      ).rejects.toEqual(problemWithValidationTryAgainText);
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
    test('can validate cluster permission', () => {
      expect(validClusterSinglePermissionOption('cluster:*')).toEqual(true);
      expect(validClusterSinglePermissionOption('cluster:a')).toEqual(true);
      expect(validClusterSinglePermissionOption('cluster:a/b/c')).toEqual(true);
    });

    test('fail to validate cluster permission', () => {
      expect(validClusterSinglePermissionOption('cluster:')).toEqual(false);
      expect(validClusterSinglePermissionOption('cat')).toEqual(false);
      expect(validClusterSinglePermissionOption('indices:a/b/c')).toEqual(false);
    });

    test('can validate single permission', () => {
      expect(validSinglePermissionOption('cluster:*')).toEqual(true);
      expect(validSinglePermissionOption('cluster:a')).toEqual(true);
      expect(validSinglePermissionOption('cluster:a/b/c')).toEqual(true);
      expect(validSinglePermissionOption('indices:*')).toEqual(true);
      expect(validSinglePermissionOption('indices:a')).toEqual(true);
      expect(validSinglePermissionOption('indices:a/b/c')).toEqual(true);
    });

    test('fail to validate single permission', () => {
      expect(validSinglePermissionOption('cluster:')).toEqual(false);
      expect(validSinglePermissionOption('indices:')).toEqual(false);
      expect(validSinglePermissionOption('cat')).toEqual(false);
    });
  });
});
