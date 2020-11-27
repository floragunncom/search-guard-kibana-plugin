/* eslint-disable @kbn/eslint/require-license-header */
/* eslint-disable no-restricted-imports */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { defaultsDeep, get, set } from 'lodash';
import { version as sgVersion } from '../../../package.json';

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
    enabled: true,
    allow_client_certificates: false,
    readonly_mode: { enabled: true, roles: [] },
    xff: { enabled: false },
    cookie: {
      secure: false,
      password: 'searchguard_cookie_default_password',
      name: 'searchguard_authentication',
      storage_cookie_name: 'searchguard_storage',
      preferences_cookie_name: 'searchguard_preferences',
      ttl: 3600000,
      isSameSite: 'Lax',
    },
    session: {
      ttl: 3600000,
      keepalive: true,
    },
    auth: {
      type: 'basicauth',
      anonymous_auth_enabled: false,
      unauthenticated_routes: ['/api/status'],
      logout_url: '',
      debug: false,
    },
    basicauth: {
      forbidden_usernames: [],
      allowed_usernames: null,
      header_trumps_session: false,
      alternative_login: {
        headers: [],
        show_for_parameter: '',
        valid_redirects: [],
        button_text: 'Login with provider',
        buttonstyle: '',
      },
      loadbalancer_url: null,
      login: {
        title: 'Please login to Kibana',
        subtitle:
          'If you have forgotten your username or password, please ask your system administrator',
        showbrandimage: true,
        brandimage: 'plugins/searchguard/assets/searchguard_logo.svg',
        buttonstyle: '',
      },
    },
    multitenancy: {
      enabled: false,
      show_roles: false,
      enable_filter: false,
      debug: false,
      tenants: {
        enable_private: true,
        enable_global: true,
        preferred: undefined,
      },
      saved_objects_migration: {
        batch_size: 100,
        scroll_duration: '15m',
        poll_interval: 1500,
        skip: false,
      },
    },
    saved_objects: {
      max_import_payload_bytes: 10485760,
      max_import_export_size: 10000,
    },
    configuration: {
      enabled: true,
    },
    accountinfo: {
      enabled: false,
    },
    openid: {
      connect_url: undefined,
      header: 'Authorization',
      client_id: undefined,
      client_secret: '',
      scope: 'openid profile email address phone',
      base_redirect_url: '',
      logout_url: '',
      root_ca: '',
      verify_hostnames: true,
    },
    proxycache: {
      user_header: undefined,
      roles_header: undefined,
      proxy_header: 'x-forwarded-for',
      proxy_header_ip: undefined,
      login_endpoint: null,
    },
    jwt: {
      enabled: false,
      login_endpoint: undefined,
      url_param: 'authorization',
      header: 'Authorization',
    },
    sgVersion,
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

  return parseKibanaConfig(fs.readFileSync(configPath, 'utf8'));
}