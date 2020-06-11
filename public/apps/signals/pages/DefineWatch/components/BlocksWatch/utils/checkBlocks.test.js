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
      request: stringifyPretty({
        indices: ['audit*'],
        body: {
          size: 5,
          query: {},
          aggs: {},
        },
      }),
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
      request: stringifyPretty({
        indices: ['audit*'],
        body: {
          size: 5,
          query: {},
          aggs: {},
        },
      }),
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
      },
    };

    const formikCheck = {
      type: 'http',
      name: '',
      target: 'samplejson',
      request: stringifyPretty({
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
      }),
      tls: '',
      response: '',
      id: expect.any(String),
    };

    expect(httpToFormikHttp(check)).toEqual(formikCheck);
  });

  test('httpToFormikHttp TLS', () => {
    const check = {
      type: 'http',
      name: 'testhttp',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
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
      request: stringifyPretty({
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
      }),
      tls: stringifyPretty({
        trusted_certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
        client_auth: {
          certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
          private_key:
            '-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----\n',
          private_key_password: 'secret',
        },
      }),
      response: '',
      id: expect.any(String),
    };

    expect(httpToFormikHttp(check)).toEqual(formikCheck);
  });

  test('formikHttpToHttp TLS', () => {
    const formikCheck = {
      type: 'http',
      name: 'testhttp',
      target: 'samplejson',
      request: stringifyPretty({
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
      }),
      tls: stringifyPretty({
        trusted_certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
        client_auth: {
          certs: '-----BEGIN CERTIFICATE-----\n....\n-----END CERTIFICATE-----\n',
          private_key:
            '-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----\n',
          private_key_password: 'secret',
        },
      }),
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

    expect(formikHttpToHttp(formikCheck)).toEqual(check);
  });

  test('formikHttpToHttp', () => {
    const formikCheck = {
      type: 'http',
      name: '',
      target: 'samplejson',
      request: stringifyPretty({
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
      }),
      tls: '',
      response: 'abc',
      id: '123',
    };

    const check = {
      type: 'http',
      target: 'samplejson',
      request: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
      },
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
