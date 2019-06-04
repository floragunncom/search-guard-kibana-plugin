import { validateESDSLQuery } from './validation';
import { jsonIsInvalidText } from './i18n/common';
import { dlsQuerySyntaxIsInvalidText } from './i18n/roles';

describe('validation', () => {
  describe('DSL Query', () => {
    test('can validate DSL Query', async () => {
      const query = JSON.stringify({ match: { a: 'b' } });
      const index = 'index';
      class HttpClient {
        static post() {
          return { data: { valid: true } };
        }
      }

      await expect(validateESDSLQuery(index, HttpClient)(query)).resolves.toEqual(undefined);
    });

    test('can validate empty DSL Query (no DSL is used)', async () => {
      const query = '';
      const index = 'index';
      class HttpClient {}

      await expect(validateESDSLQuery(index, HttpClient)(query)).resolves.toEqual(undefined);
    });

    test('fail to validate DSL Query due to wrong syntax', async () => {
      const query = JSON.stringify({ matchesssssss: { a: 'b' } });
      const index = 'index';
      class HttpClient {
        static post() {
          return { data: { valid: false } };
        }
      }

      await expect(validateESDSLQuery(index, HttpClient)(query)).resolves.toEqual(dlsQuerySyntaxIsInvalidText);
    });

    test('fail to validate DSL Query due to wrong JSON', async () => {
      const query = '{"a"}';
      const index = 'index';
      class HttpClient {}

      await expect(validateESDSLQuery(index, HttpClient)(query)).resolves.toEqual(jsonIsInvalidText);
    });
  });
});
