import { buildChecksFromChecksBlocks } from './buildChecksFromChecksBlocks';
import { stringifyPretty } from '../../../../../utils/helpers';

describe('buildChecksFromChecksBlocks', () => {
  test('can build "static" check', () => {
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

    const checks = [
      {
        type: 'static',
        name: 'constants',
        value: {
          a: 1,
        },
      },
    ];

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });

  test('can build "condition" check', () => {
    const formikChecks = [
      {
        type: 'condition',
        name: 'acondition',
        source: 'data.mysearch.hits.hits.length > 0',
        id: 0,
        response: '',
        target: '',
      },
    ];

    const checks = [
      {
        type: 'condition',
        name: 'acondition',
        source: 'data.mysearch.hits.hits.length > 0',
        lang: 'painless',
      },
    ];

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });

  test('can build "transform" check', () => {
    const formikChecks = [
      {
        type: 'transform',
        name: 'atransform',
        source: 'return data.logs.hits.hits;',
        id: 0,
        response: '',
        target: '',
      },
    ];

    const checks = [
      {
        type: 'transform',
        name: 'atransform',
        source: 'return data.logs.hits.hits;',
        lang: 'painless',
      },
    ];

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });

  test('can build "calc" check', () => {
    const formikChecks = [
      {
        type: 'calc',
        name: 'acalc',
        source:
          'int total = 0; for (int i = 0; i < data.logs.hits.hits.length; ++i) { total += data.logs.hits.hits[i]._source.memory; } data.average_memory = total / data.logs.hits.hits.length;',
        id: 0,
        response: '',
        target: '',
      },
    ];

    const checks = [
      {
        type: 'calc',
        name: 'acalc',
        source:
          'int total = 0; for (int i = 0; i < data.logs.hits.hits.length; ++i) { total += data.logs.hits.hits[i]._source.memory; } data.average_memory = total / data.logs.hits.hits.length;',
        lang: 'painless',
      },
    ];

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });

  test('can build "search" check', () => {
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

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });

  test('can build "http" check', () => {
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

    const checks = [
      {
        type: 'http',
        name: 'a',
        request: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET',
          headers: { 'My-Secret-Token': 'pizza' },
          connection_timeout: 120,
          read_timeout: 240,
        },
      },
    ];

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });

  test('can build "http" check with basic auth', () => {
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
          read_timeout: 240,
          connection_timeout: 120,
        },
      },
    ];

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });

  test('can create "http" check block with TLS', () => {
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
          trust_all: true,
        },
      },
    ];

    const checks = [
      {
        type: 'http',
        name: 'a',
        request: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          method: 'GET',
          read_timeout: 240,
          connection_timeout: 120,
        },
        tls: {
          trusted_certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
          client_auth: {
            certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
            private_key:
              '-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----\n',
            private_key_password: 'secret',
          },
          trust_all: true,
          verify_hostnames: false,
        },
      },
    ];

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });
});
