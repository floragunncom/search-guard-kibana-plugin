import { validateESDLSQuery } from './validation';
import { jsonIsInvalidText } from './i18n/common';
import { dlsQuerySyntaxIsInvalidText } from './i18n/roles';

describe('validation', () => {
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

      await expect(validateESDLSQuery(index, HttpClient)(query)).resolves.toEqual(dlsQuerySyntaxIsInvalidText);
    });

    test('fail to validate DLS Query due to wrong JSON', async () => {
      const query = '{"a"}';
      const index = 'index';
      class HttpClient {}

      await expect(validateESDLSQuery(index, HttpClient)(query)).resolves.toEqual(jsonIsInvalidText);
    });
  });
});
