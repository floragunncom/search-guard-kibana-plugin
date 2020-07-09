/* eslint-disable @kbn/eslint/require-license-header */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { defaultsDeep, get, set } from 'lodash';
import { SG_GLOBAL_TENANT_NAME } from '../../utils/constants';

export const DEFAULT_CONFIG = {
  elasticsearch: {
    customHeaders: {},
    hosts: ['http://localhost:9200'],
    logQueries: false,
    password: 'pass',
    pingTimeout: 1500,
    preserveHost: true,
    requestHeadersWhitelist: ['authorization'],
    requestTimeout: 30000,
    shardTimeout: 30000,
    ssl: {
      alwaysPresentCertificate: false,
    },
    startupTimeout: 5000,
    username: 'kibana_system',
  },
  i18n: {
    locale: 'en',
  },
  kibana: {
    index: '.kibana',
  },
  logging: {
    dest: 'stdout',
    quiet: false,
    silent: false,
    verbose: false,
  },
  ops: {
    interval: 5000,
  },
  pid: {},
  server: {
    basePath: '',
    host: 'localhost',
    maxPayloadBytes: 1048576,
    name: 'your-hostname',
    port: 5601,
    rewriteBasePath: false,
    ssl: {
      enabled: false,
    },
  },
  searchguard: {
    cookie: {
      password: 'searchguard_cookie_default_password',
    },
  },
  dynamic: {
    multitenancy: {
      current_tenant: SG_GLOBAL_TENANT_NAME,
    },
  },
};

export function nestConfigProperties(config = {}) {
  const keys = Object.keys(config);

  for (let i = 0; i < keys.length; i++) {
    const property = keys[i];

    if (typeof config[property] === 'object' && config[property] !== null) {
      nestConfigProperties(config[property]);
    }

    if (property.includes('.')) {
      const [...subProperties] = property.split('.');

      for (let j = 0; j < subProperties.length; j++) {
        const subProperty = subProperties.slice(0, j + 1);
        set(config, subProperty, get(config, subProperty, {}));
      }

      const value = config[property];
      delete config[property];
      set(config, property, value);
    }
  }

  return config;
}

export function parseKibanaConfig(rawConfig = '') {
  let config = {};

  try {
    config = yaml.safeLoad(rawConfig) || {};
    return defaultsDeep(nestConfigProperties(config), DEFAULT_CONFIG);
  } catch (error) {
    throw new Error(`Fail to read kibana.yml. Make sure it is correct. Error: ${error.toString()}`);
  }
}

export function readKibanaConfig({ configPath = '', isDev = false } = {}) {
  if (!configPath) {
    const kibanaYmlPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      'config',
      'kibana.yml'
    );

    const kibanaDevYmlPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      'config',
      'kibana.dev.yml'
    );

    if (isDev && fs.existsSync(kibanaDevYmlPath)) {
      configPath = kibanaDevYmlPath;
    } else {
      configPath = kibanaYmlPath;
    }
  }

  return Promise.resolve(parseKibanaConfig(fs.readFileSync(configPath, 'utf8')));
}
