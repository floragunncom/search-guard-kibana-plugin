import { buildFormikChecksBlocks } from './buildFormikChecksBlocks';
import { stringifyPretty } from '../../../../../utils/helpers';

describe('buildFormikChecksBlocks', () => {
  test('can create "static" check block for formik', () => {
    const checks = [
      {
        type: 'static',
        name: 'constants',
        value: {
          a: 1,
        },
      },
    ];

    const formikChecks = [
      {
        type: 'static',
        name: 'constants',
        value: stringifyPretty({
          a: 1,
        }),
        id: 0,
        response: '',
        target: '',
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create checks blocks formik if unknown check', () => {
    const checks = [
      {
        type: 'unknown',
      },
    ];

    const formikChecks = [
      {
        type: 'static',
        value: stringifyPretty({
          error: `Unknown block type "unknown"! Please report to developers. Defaults to static type.`,
        }),
        id: 0,
        response: '',
        target: '',
        name: '',
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create "condition" check blocks for formik', () => {
    const checks = [
      {
        type: 'condition',
        name: 'acondition',
        source: 'data.mysearch.hits.hits.length > 0',
      },
      {
        type: 'condition.script',
        name: 'bcondition',
        source: 'data.mysearch.hits.hits.length > 1',
      },
    ];

    const formikChecks = [
      {
        type: 'condition',
        name: 'acondition',
        source: 'data.mysearch.hits.hits.length > 0',
        id: 0,
        response: '',
        target: '',
        lang: 'painless',
      },
      {
        type: 'condition',
        name: 'bcondition',
        source: 'data.mysearch.hits.hits.length > 1',
        id: 1,
        response: '',
        target: '',
        lang: 'painless',
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create "transform" check block for formik', () => {
    const checks = [
      {
        type: 'transform',
        name: 'a',
        source: 'return data.logs.hits.hits;',
      },
    ];

    const formikChecks = [
      {
        type: 'transform',
        name: 'a',
        source: 'return data.logs.hits.hits;',
        id: 0,
        response: '',
        target: '',
        lang: 'painless',
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create "calc" check block for formik', () => {
    const checks = [
      {
        type: 'calc',
        name: 'a',
        source:
          'int total = 0; for (int i = 0; i < data.logs.hits.hits.length; ++i) { total += data.logs.hits.hits[i]._source.memory; } data.average_memory = total / data.logs.hits.hits.length;',
      },
    ];

    const formikChecks = [
      {
        type: 'calc',
        name: 'a',
        source:
          'int total = 0; for (int i = 0; i < data.logs.hits.hits.length; ++i) { total += data.logs.hits.hits[i]._source.memory; } data.average_memory = total / data.logs.hits.hits.length;',
        id: 0,
        response: '',
        target: '',
        lang: 'painless',
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create "search" check block for formik', () => {
    const checks = [
      {
        type: 'search',
        name: 'a',
        request: {
          indices: ['a', 'b'],
          body: {
            size: 5,
            query: { match_all: {} },
          },
        },
      },
    ];

    const formikChecks = [
      {
        type: 'search',
        name: 'a',
        id: 0,
        response: '',
        target: '',
        request: {
          indices: [
            {
              label: 'a',
            },
            {
              label: 'b',
            },
          ],
          body: stringifyPretty({
            size: 5,
            query: { match_all: {} },
          }),
        },
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create "http" check block for formik', () => {
    const checks = [
      {
        type: 'http',
        name: 'a',
        request: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET',
          headers: { 'My-Secret-Token': 'pizza' },
        },
      },
    ];

    const formikChecks = [
      {
        type: 'http',
        name: 'a',
        id: 0,
        response: '',
        target: '',
        request: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET',
          headers: JSON.stringify({ 'My-Secret-Token': 'pizza' }),
          auth: {
            type: 'basic',
            password: '',
            username: '',
          },
          body: '',
          connection_timeout: 120,
          path: '',
          query_params: '',
          read_timeout: 240,
        },
        tls: {
          client_auth: {
            certs: '',
            private_key: '',
            private_key_password: '',
          },
          trust_all: false,
          trusted_certs: '',
          verify_hostnames: false,
        },
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create "http" check block with basic auth for formik', () => {
    const checks = [
      {
        type: 'http',
        name: 'a',
        request: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET',
          auth: {
            type: 'basic',
            username: 'admin',
            password: 'admin',
          },
        },
      },
    ];

    const formikChecks = [
      {
        type: 'http',
        name: 'a',
        id: 0,
        response: '',
        target: '',
        request: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET',
          headers: '{}',
          auth: {
            type: 'basic',
            password: 'admin',
            username: 'admin',
          },
          body: '',
          connection_timeout: 120,
          path: '',
          query_params: '',
          read_timeout: 240,
        },
        tls: {
          client_auth: {
            certs: '',
            private_key: '',
            private_key_password: '',
          },
          trust_all: false,
          trusted_certs: '',
          verify_hostnames: false,
        },
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create "http" check block with TLS for formik', () => {
    const checks = [
      {
        type: 'http',
        name: 'a',
        request: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET',
        },
        tls: {
          trusted_certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
          client_auth: {
            certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
            private_key:
              '-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----\n',
            private_key_password: 'secret',
          },
        },
      },
    ];

    const formikChecks = [
      {
        type: 'http',
        name: 'a',
        id: 0,
        response: '',
        target: '',
        request: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET',
          headers: '{}',
          auth: {
            type: 'basic',
            password: '',
            username: '',
          },
          body: '',
          connection_timeout: 120,
          path: '',
          query_params: '',
          read_timeout: 240,
        },
        tls: {
          trusted_certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
          client_auth: {
            certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
            private_key:
              '-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----\n',
            private_key_password: 'secret',
          },
          trust_all: false,
          verify_hostnames: false,
        },
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });
});
