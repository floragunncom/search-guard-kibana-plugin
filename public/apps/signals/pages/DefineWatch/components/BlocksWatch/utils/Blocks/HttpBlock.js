/* eslint-disable camelcase */
import { defaultsDeep } from 'lodash';
import { Block } from './Block';

export const REQUEST_METHODS = ['GET', 'PUT', 'POST', 'DELETE'];

export const REQUEST_AUTH_DEFAULTS = {
  type: 'basic',
  username: '',
  password: '',
};

export const REQUEST_DEFAULTS = {
  url: '',
  path: '',
  query_params: '',
  method: 'GET',
  body: '',
  headers: {},
  connection_timeout: 120,
  read_timeout: 240,
  auth: REQUEST_AUTH_DEFAULTS,
};

export const TLS_DEFAULTS = {
  verify_hostnames: false,
  trust_all: false,
  trusted_certs: '',
  client_auth: {
    certs: '',
    private_key: '',
    private_key_password: '',
  },
};

export class HttpBlock extends Block {
  static get type() {
    return 'http';
  }

  constructor({ id, name = '', target = '', response = '', request = {}, tls = {} }) {
    super({ id, name, target, response });
    this.request = defaultsDeep(request, REQUEST_DEFAULTS);
    this.tls = defaultsDeep(tls, TLS_DEFAULTS);
  }

  get type() {
    return HttpBlock.type;
  }

  toFormik() {
    const formik = {
      type: HttpBlock.type,
      id: this.id,
      name: this.name,
      target: this.target,
      response: this.response,
      tls: this.tls,
    };

    const request = defaultsDeep({}, this.request);

    try {
      request.headers = JSON.stringify(this.request.headers);
    } catch (error) {
      request.headers = '{}';
      console.log('HttpBlock - Fail to stringify headers', error);
    }

    formik.request = request;

    return formik;
  }

  toWatchCheck() {
    const check = { type: HttpBlock.type };

    if (this.name) check.name = this.name;
    if (this.target) check.target = this.target;

    check.request = this.buildWatchCheckRequest();
    const tls = this.buildWatchCheckTLS();
    if (tls) check.tls = tls;

    return check;
  }

  buildWatchCheckRequest() {
    const request = {};

    let headers = {};
    try {
      headers = JSON.parse(this.request.headers);
    } catch (error) {
      console.log('HttpBlock - Fail to parse headers', error);
    }

    if (!!Object.keys(headers).length) request.headers = headers;

    for (const [key, value] of Object.entries(this.request)) {
      if (key === 'headers') {
        continue;
      }

      if (key === 'auth') {
        if (value.username && value.password) request.auth = this.request.auth;
      } else if (typeof value === 'string') {
        if (!!value.length) request[key] = value;
      } else {
        request[key] = value;
      }
    }

    return request;
  }

  buildWatchCheckTLS() {
    const tls = {};

    for (const [key, value] of Object.entries(this.tls)) {
      if (typeof value === 'string') {
        if (!!value.length) tls[key] = value;
      } else if (key === 'client_auth') {
        const client_auth = {};

        for (const [key, value] of Object.entries(this.tls.client_auth)) {
          if (value) client_auth[key] = value;
        }

        if (!!Object.keys(client_auth).length) tls.client_auth = client_auth;
      } else {
        tls[key] = value;
      }
    }

    const isTLSEnabled = !!Object.keys(tls).filter(
      key => key !== 'verify_hostnames' && key !== 'trust_all'
    ).length;

    return isTLSEnabled ? tls : null;
  }
}
