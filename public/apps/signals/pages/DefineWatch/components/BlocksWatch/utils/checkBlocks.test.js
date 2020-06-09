/* eslint-disable @kbn/eslint/require-license-header */
import { stringifyPretty } from '../../../../../utils/helpers';
import {
  staticToFormikStatic,
  formikStaticToStatic,
  searchToFormikSearch,
  formikSearchToSearch,
  httpToFormikHttp,
  formikHttpToHttp,
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
      value: stringifyPretty({
        indices: ['audit*'],
        body: {
          size: 5,
          query: {},
          aggs: {},
        },
      }),
    };

    expect(searchToFormikSearch(check)).toEqual(formikCheck);
  });

  test('formikSearchToSearch', () => {
    const formikCheck = {
      type: 'search',
      name: 'Audit log events',
      target: 'auditlog',
      value: stringifyPretty({
        indices: ['audit*'],
        body: {
          size: 5,
          query: {},
          aggs: {},
        },
      }),
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
      value: stringifyPretty({
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
      }),
      tls: '',
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
      value: stringifyPretty({
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
    };

    expect(httpToFormikHttp(check)).toEqual(formikCheck);
  });

  test('formikHttpToHttp TLS', () => {
    const formikCheck = {
      type: 'http',
      name: 'testhttp',
      target: 'samplejson',
      value: stringifyPretty({
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
      value: stringifyPretty({
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET',
        headers: { 'My-Secret-Token': 'pizza' },
      }),
      tls: '',
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
});
