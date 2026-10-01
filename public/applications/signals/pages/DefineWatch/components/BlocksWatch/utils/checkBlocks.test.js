/* eslint-disable @kbn/eslint/require-license-header */
import { stringifyPretty } from '../../../../../utils/helpers';
import {
  staticToFormikStatic,
  formikStaticToStatic,
  searchToFormikSearch,
  formikSearchToSearch,
  httpToFormikHttp,
  formikHttpToHttp,
  transformToFormikTransform,
  formikTransformToTransform,
  calcToFormikCalc,
  formikCalcToCalc,
  conditionToFormikCondition,
  formikConditionToCondition,
} from './checkBlocks';

describe('checkBlocks', () => {
  test('staticToFormikStatic', () => {
    const check = {
      type: 'static',
      target: 'myconstants',
      value: {
        threshold: 10,
        time_period: '10s',
        admin_lastname: 'Anderson',
        admin_firstname: 'Paul',
      },
    };

    const formikCheck = {
      type: 'static',
      name: '',
      target: 'myconstants',
      value: stringifyPretty({
        threshold: 10,
        time_period: '10s',
        admin_lastname: 'Anderson',
        admin_firstname: 'Paul',
      }),
      response: '',
      id: expect.any(String),
    };

    expect(staticToFormikStatic(check)).toEqual(formikCheck);
  });

  test('formikStaticToStatic', () => {
    const formikCheck = {
      type: 'static',
      name: 'constants',
      target: 'myconstants',
      value: stringifyPretty({
        threshold: 10,
        time_period: '10s',
        admin_lastname: 'Anderson',
        admin_firstname: 'Paul',
      }),
      response: 'abc',
      id: '123',
    };

    const check = {
      type: 'static',
      name: 'constants',
      target: 'myconstants',
      value: {
        threshold: 10,
        time_period: '10s',
        admin_lastname: 'Anderson',
        admin_firstname: 'Paul',
      },
    };

    expect(formikStaticToStatic(formikCheck)).toEqual(check);
  });

  test('searchToFormikSearch', () => {
    const check = {
      type: 'search',
      target: 'auditlog',
      request: {
        indices: ['audit*'],
        body: {
          size: 5,
          query: {},
          aggs: {},
        },
      },
    };

    const formikCheck = {
      type: 'search',
      name: '',
      target: 'auditlog',
      request: {
        indices: [{ label: 'audit*' }],
        body: stringifyPretty({
          size: 5,
          query: {},
          aggs: {},
        }),
      },
      response: '',
      id: expect.any(String),
    };

    expect(searchToFormikSearch(check)).toEqual(formikCheck);
  });

  test('formikSearchToSearch', () => {
    const formikCheck = {
      type: 'search',
      name: 'Audit log events',
      target: 'auditlog',
      request: {
        indices: [{ label: 'audit*' }],
        body: stringifyPretty({
          size: 5,
          query: {},
          aggs: {},
        }),
      },
      response: 'abc',
      id: '123',
    };

    const check = {
      type: 'search',
      name: 'Audit log events',
      target: 'auditlog',
      request: {
        indices: ['audit*'],
        body: {
          size: 5,
          query: {},
          aggs: {},
        },
      },
    };

    expect(formikSearchToSearch(formikCheck)).toEqual(check);
  });

  test('httpToFormikHttp', () => {
    const check = {
      type: 'http',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
        query_params: { foo: 'bar' },
      },
    };

    const formikCheck = {
      type: 'http',
      name: '',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: [{ label: 'GET' }],
        headers: stringifyPretty({ 'My-Secret-Token': 'pizza' }),
        body: '',
        path: '',
        query_params: stringifyPretty({ foo: 'bar' }),
        auth: {
          type: 'basic',
          username: '',
          password: '',
        },
      },
      tls: {
        trusted_certs: '',
        trust_all: false,
        verify_hostnames: false,
        client_auth: {
          certs: '',
          private_key: '',
          private_key_password: '',
        },
      },
      response: '',
      isAuth: false,
      isTLS: false,
      connection_timeout: 60,
      read_timeout: 60,
      id: expect.any(String),
    };

    expect(httpToFormikHttp(check)).toEqual(formikCheck);
  });

  test('httpToFormikHttp TLS and auth', () => {
    const check = {
      type: 'http',
      name: 'testhttp',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
        auth: {
          type: 'basic',
          username: 'admin',
          password: 'xyz',
        },
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
    };

    const formikCheck = {
      type: 'http',
      name: 'testhttp',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: [{ label: 'GET' }],
        headers: stringifyPretty({ 'My-Secret-Token': 'pizza' }),
        body: '',
        path: '',
        query_params: '',
        auth: {
          type: 'basic',
          username: 'admin',
          password: 'xyz',
        },
      },
      tls: {
        trusted_certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
        trust_all: false,
        verify_hostnames: false,
        client_auth: {
          certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
          private_key:
            '-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----\n',
          private_key_password: 'secret',
        },
      },
      isAuth: true,
      isTLS: true,
      connection_timeout: 60,
      read_timeout: 60,
      response: '',
      id: expect.any(String),
    };

    expect(httpToFormikHttp(check)).toEqual(formikCheck);
  });

  test('formikHttpToHttp TLS and auth', () => {
    const formikCheck = {
      type: 'http',
      name: 'testhttp',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: [{ label: 'GET' }],
        headers: stringifyPretty({ 'My-Secret-Token': 'pizza' }),
        body: '',
        path: '',
        query_params: '',
        auth: {
          type: 'basic',
          username: 'admin',
          password: 'xyz',
        },
      },
      tls: {
        trusted_certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
        trust_all: true,
        verify_hostnames: false,
        client_auth: {
          certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
          private_key:
            '-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----\n',
          private_key_password: 'secret',
        },
      },
      isAuth: true,
      isTLS: true,
      connection_timeout: 60,
      read_timeout: 60,
      response: 'abc',
      id: '123',
    };

    const check = {
      type: 'http',
      name: 'testhttp',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
        auth: {
          type: 'basic',
          username: 'admin',
          password: 'xyz',
        },
      },
      tls: {
        trusted_certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
        trust_all: true,
        verify_hostnames: false,
        client_auth: {
          certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
          private_key:
            '-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----\n',
          private_key_password: 'secret',
        },
      },
      connection_timeout: 60,
      read_timeout: 60,
    };

    expect(formikHttpToHttp(formikCheck)).toEqual(check);
  });

  test('formikHttpToHttp', () => {
    const formikCheck = {
      type: 'http',
      name: '',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: [{ label: 'GET' }],
        headers: stringifyPretty({ 'My-Secret-Token': 'pizza' }),
        body: 'count: {{data.hits.total.value}}',
        path: '/alarm/{{data.watch_id}}',
        query_params: stringifyPretty({
          watch_id: '{{data.watch.id}}',
        }),
        auth: {
          type: 'basic',
          username: '',
          password: '',
        },
      },
      tls: {
        trust_all: false,
        verify_hostnames: false,
        trusted_certs: '',
        client_auth: {
          certs: '',
          private_key: '',
          private_key_password: '',
        },
      },
      isAuth: false,
      isTLS: false,
      connection_timeout: 60,
      read_timeout: 60,
      response: 'abc',
      id: '123',
    };

    const check = {
      type: 'http',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        path: '/alarm/{{data.watch_id}}',
        query_params: {
          watch_id: '{{data.watch.id}}',
        },
        body: 'count: {{data.hits.total.value}}',
        headers: { 'My-Secret-Token': 'pizza' },
      },
      connection_timeout: 60,
      read_timeout: 60,
    };

    expect(formikHttpToHttp(formikCheck)).toEqual(check);
  });

  test('transformToFormikTransform', () => {
    const check = {
      type: 'transform',
      target: 'mysearchresult',
      source: 'return data.logs.hits.hits;',
    };

    const formikCheck = {
      type: 'transform',
      name: '',
      target: 'mysearchresult',
      source: 'return data.logs.hits.hits;',
      lang: 'painless',
      response: '',
      id: expect.any(String),
    };

    expect(transformToFormikTransform(check)).toEqual(formikCheck);
  });

  test('formikTransformToTransform', () => {
    const formikCheck = {
      type: 'transform',
      name: 'extract_search_hits',
      target: 'mysearchresult',
      source: 'return data.logs.hits.hits;',
      lang: 'painless',
      response: 'abc',
      id: '123',
    };

    const check = {
      type: 'transform',
      name: 'extract_search_hits',
      target: 'mysearchresult',
      source: 'return data.logs.hits.hits;',
      lang: 'painless',
    };

    expect(formikTransformToTransform(formikCheck)).toEqual(check);
  });

  test('calcToFormikCalc', () => {
    const check = {
      type: 'calc',
      source:
        'int total = 0; for (int i = 0; i < data.logs.hits.hits.length; ++i) { total += data.logs.hits.hits[i]._source.memory; } data.average_memory = total / data.logs.hits.hits.length;',
    };

    const formikCheck = {
      type: 'calc',
      name: '',
      target: '',
      source:
        'int total = 0; for (int i = 0; i < data.logs.hits.hits.length; ++i) { total += data.logs.hits.hits[i]._source.memory; } data.average_memory = total / data.logs.hits.hits.length;',
      response: '',
      id: expect.any(String),
    };

    expect(calcToFormikCalc(check)).toEqual(formikCheck);
  });

  test('formikCalcToCalc', () => {
    const formikCheck = {
      type: 'calc',
      name: 'avg_memory',
      target: '',
      source:
        'int total = 0; for (int i = 0; i < data.logs.hits.hits.length; ++i) { total += data.logs.hits.hits[i]._source.memory; } data.average_memory = total / data.logs.hits.hits.length;',
      response: 'abc',
      id: '123',
    };

    const check = {
      type: 'calc',
      name: 'avg_memory',
      source:
        'int total = 0; for (int i = 0; i < data.logs.hits.hits.length; ++i) { total += data.logs.hits.hits[i]._source.memory; } data.average_memory = total / data.logs.hits.hits.length;',
    };

    expect(formikCalcToCalc(formikCheck)).toEqual(check);
  });

  test('conditionToFormikCondition', () => {
    const check = {
      type: 'condition',
      name: 'mycondition',
      source: 'data.mysearch.hits.hits.length > 0',
    };

    const formikCheck = {
      type: 'condition',
      name: 'mycondition',
      target: '',
      source: 'data.mysearch.hits.hits.length > 0',
      lang: 'painless',
      response: '',
      id: expect.any(String),
    };

    expect(conditionToFormikCondition(check)).toEqual(formikCheck);
  });

  test('formikConditionToCondition', () => {
    const formikCheck = {
      type: 'condition',
      name: 'mycondition',
      target: '',
      source: 'data.mysearch.hits.hits.length > 0',
      lang: 'painless',
      response: 'abc',
      id: '123',
    };

    const check = {
      type: 'condition',
      name: 'mycondition',
      source: 'data.mysearch.hits.hits.length > 0',
      lang: 'painless',
    };

    expect(formikConditionToCondition(formikCheck)).toEqual(check);
  });
});
