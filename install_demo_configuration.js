/*
 *    Copyright 2021 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const selfsigned = require('selfsigned');
const crypto = require('crypto');
const { defaultsDeep } = require('lodash');

const BASIC_LOGIN = 'Basic Login demo';
const SSO_OPENID = 'OpenID Connect demo';
const SSO_JWT = 'JWT demo';
const SSO_SAML = 'SAML demo';
const SSO_PROXY = 'Proxy demo';
const KERBEROS = 'Kerberos demo';
const KIBANA_YML_FILENAME = 'kibana.yml';
const KIBANA_CONFIG_PATH = path.resolve(__dirname, '..', '..', 'config');
const KIBANA_YML_PATH = path.resolve(__dirname, '..', '..', 'config', KIBANA_YML_FILENAME);
const KIBANA_XPACK_PATH = path.resolve(__dirname, '..', '..', 'x-pack');
const TLS_PUB_KEY_FILENAME = 'searchguard_kibana.pub.key.pem';
const TLS_PRIV_KEY_FILENAME = 'searchguard_kibana.priv.key.pem';
const TLS_CRT_FILENAME = 'searchguard_kibana.crt.pem';

function isFileExists(path) {
  return fs.accessSync(path, fs.constants.R_OK) === undefined;
}

function isFileExistsAndWritable(path) {
  return fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK) === undefined;
}

function isFolderExistsAndWritable(path) {
  return isFileExistsAndWritable(path) && fs.statSync(path).isDirectory();
}

function generateCookiePassword() {
  return crypto.createHash('md5').update(Math.random().toString(36)).digest('hex');
}

function showHelloMessage() {
  console.log(chalk.yellow.bold(figlet.textSync('Search Guard', { horizontalLayout: 'full' })));
}

function showSuccessMessage({ kibanaConfigPath }) {
  console.log(
    chalk.yellow.bold('The Search Guard Kibana plugin has been successfully configured!\n')
  );
  console.log(
    chalk.yellow.bold(
      `ATTENTION!!! Double-check the hostnames, IP addresses and credentials in the ${kibanaConfigPath}. Adjust if needed. Make sure you configured the Search Guard Elasticsearch plugin accordingly.`
    )
  );
  console.log(
    chalk.yellow.bold(
      'Check the documentation https://docs.search-guard.com/latest/authentication-authorization'
    )
  );
}

// Set skipInvalid=true to be able to put regexps and functions
function writeKibanaConfig({ kibanaConfig, kibanaConfigPath, skipInvalid = true } = {}) {
  // Backup the existing kibana.yml
  fs.copyFileSync(kibanaConfigPath, kibanaConfigPath + '_' + Date.now());
  return fs.writeFileSync(kibanaConfigPath, yaml.dump(kibanaConfig, { skipInvalid }) + '\n');
}

function getCommonSettings({ certsFolder }) {
  const config = {
    server: {
      host: '0.0.0.0',
      ssl: {
        enabled: true,
        certificate: path.resolve(certsFolder, TLS_CRT_FILENAME),
        key: path.resolve(certsFolder, TLS_PRIV_KEY_FILENAME),
      },
    },
    opensearch: {
      hosts: 'https://localhost:9200',
      username: 'kibanaserver',
      password: 'kibanaserver',
      requestHeadersWhitelist: [
        'sg_impersonate_as',
        'sgtenant',
        'authorization',
        'x-forwarded-for',
        'x-proxy-user',
        'x-proxy-roles',
        'sg_impersonate_as',
      ],
      ssl: {
        verificationMode: 'none',
      },
    },
    logging: {
      quiet: false,
    },
    searchguard: {
      cookie: {
        password: generateCookiePassword(),
      },
      accountinfo: {
        enabled: true,
      },
      multitenancy: {
        enabled: true,
        show_roles: true,
        enable_filter: true,
        tenants: {
          enable_global: true,
        },
      },
    },
  };

  // We must disable xpack security!
  if (isFileExists(KIBANA_XPACK_PATH)) {
    config.xpack = {
      security: {
        enabled: false,
      },
    };
  }

  return config;
}

function writeTLSCertificates(certsFolder) {
  const attrs = [
    {
      name: 'commonName',
      value: 'kibana.searchguard.example.com',
    },
    {
      name: 'countryName',
      value: 'DE',
    },
    {
      shortName: 'ST',
      value: 'Neverland',
    },
    {
      name: 'localityName',
      value: 'Neverland',
    },
    {
      name: 'organizationName',
      value: 'Client',
    },
    {
      shortName: 'OU',
      value: 'Test',
    },
  ];

  const options = {
    keySize: 1024,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      { name: 'basicConstraints', cA: false },
      {
        name: 'keyUsage',
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
      },
    ],
  };

  const pems = selfsigned.generate(attrs, options);

  const tlsKeyPath = path.resolve(certsFolder, TLS_PRIV_KEY_FILENAME);
  const tlsPubKeyPath = path.resolve(certsFolder, TLS_PUB_KEY_FILENAME);
  const tlsCrtPath = path.resolve(certsFolder, TLS_CRT_FILENAME);

  fs.writeFileSync(tlsKeyPath, pems.private);
  fs.writeFileSync(tlsPubKeyPath, pems.public);
  fs.writeFileSync(tlsCrtPath, pems.cert);
}

function getBasicLoginConfig({ certsFolder }) {
  const defaultConfig = getCommonSettings({ certsFolder });
  const config = { searchguard: { auth: { type: 'basicauth' } } };

  defaultsDeep(config, defaultConfig);
  return config;
}

function getOIDCConfig({ certsFolder }) {
  const defaultConfig = getCommonSettings({ certsFolder });
  const config = {
    elasticsearch: {
      requestHeadersWhitelist: [
        'sgtenant',
        'authorization',
        'X-Forwarded-For',
        'x-proxy-user',
        'x-proxy-roles',
        'urltoken',
      ],
    },
    searchguard: {
      openid: {
        base_redirect_url: 'https://kibana.example.com:5601',
        connect_url: 'http://idp.com:8080/auth/realms/master/.well-known/openid-configuration',
        client_id: 'es-openid',
        client_secret: 'secret',
        scope: 'profile email',
      },
      auth: {
        type: 'openid',
      },
    },
  };

  defaultsDeep(config, defaultConfig);
  return config;
}

function getJWTConfig({ certsFolder }) {
  const defaultConfig = getCommonSettings({ certsFolder });
  const config = {
    elasticsearch: {
      requestHeadersWhitelist: [
        'sgtenant',
        'authorization',
        'X-Forwarded-For',
        'x-proxy-user',
        'x-proxy-roles',
        'urltoken',
      ],
    },
    searchguard: {
      jwt: {
        url_param: 'urltoken',
        header: 'authorization',
        login_endpoint: 'http://idp.com',
      },
      auth: {
        type: 'jwt',
      },
    },
  };

  defaultsDeep(config, defaultConfig);
  return config;
}

function getSSOProxyConfig({ certsFolder }) {
  const defaultConfig = getCommonSettings({ certsFolder });
  const config = {
    elasticsearch: {
      requestHeadersWhitelist: [
        'sg_impersonate_as',
        'sgtenant',
        'authorization',
        'X-Forwarded-For',
        'x-proxy-user',
        'x-proxy-roles',
        'urltoken',
      ],
    },
    searchguard: {
      auth: {
        type: 'proxy',
      },
    },
  };

  defaultsDeep(config, defaultConfig);
  return config;
}

function getSAMLConfig({ certsFolder }) {
  const defaultConfig = getCommonSettings({ certsFolder });
  const config = {
    server: {
      xsrf: {
        whitelist: ['/searchguard/saml/acs', '/searchguard/saml/logout'],
      },
    },
    elasticsearch: {
      requestHeadersWhitelist: [
        'sgtenant',
        'authorization',
        'X-Forwarded-For',
        'x-proxy-user',
        'x-proxy-roles',
        'urltoken',
      ],
    },
    searchguard: {
      cookie: {
        secure: true,
        isSameSite: 'None',
      },
      auth: {
        type: 'saml',
      },
    },
  };

  defaultsDeep(config, defaultConfig);
  return config;
}

function getKerberosConfig({ certsFolder }) {
  const defaultConfig = getCommonSettings({ certsFolder });
  const config = {
    elasticsearch: {
      requestHeadersWhitelist: [
        'sgtenant',
        'x-authenticated-user',
        'authorization',
        'x-forwarded-for',
        'x-forwarded-server',
        'x-forwarded-by',
        'x-proxy-user',
        'x-proxy-roles',
      ],
    },
    searchguard: {
      auth: {
        type: 'kerberos',
      },
    },
  };

  defaultsDeep(config, defaultConfig);
  return config;
}

function getConfig({ certsFolder, configName }) {
  let kibanaConfig;

  switch (configName) {
    case BASIC_LOGIN:
      kibanaConfig = getBasicLoginConfig({ certsFolder });
      break;
    case SSO_OPENID:
      kibanaConfig = getOIDCConfig({ certsFolder });
      break;
    case SSO_JWT:
      kibanaConfig = getJWTConfig({ certsFolder });
      break;
    case SSO_SAML:
      kibanaConfig = getSAMLConfig({ certsFolder });
      break;
    case SSO_PROXY:
      kibanaConfig = getSSOProxyConfig({ certsFolder });
      break;
    case KERBEROS:
      kibanaConfig = getKerberosConfig({ certsFolder });
      break;
    default:
      break;
  }

  return kibanaConfig;
}

async function askForConfiguration() {
  try {
    const questions = [
      {
        name: 'configName',
        type: 'list',
        message: 'What do you want to configure?',
        choices: [BASIC_LOGIN, SSO_OPENID, SSO_JWT, SSO_SAML, SSO_PROXY, KERBEROS],
      },
      {
        name: 'kibanaConfigPath',
        type: 'input',
        message: 'Path to the kibana.yml',
        default: KIBANA_YML_PATH,
      },
      {
        name: 'certsFolder',
        type: 'input',
        message: 'Path to the TLS certificates folder',
        default: KIBANA_CONFIG_PATH,
      },
      {
        name: 'confirm',
        type: 'confirm',
        message: 'Save?',
      },
    ];

    const { configName, kibanaConfigPath, certsFolder, confirm } = await inquirer.prompt(questions);

    if (!confirm) process.exit(0);

    isFileExistsAndWritable(kibanaConfigPath);
    isFolderExistsAndWritable(certsFolder);

    return { kibanaConfig: getConfig({ certsFolder, configName }), kibanaConfigPath, certsFolder };
  } catch (error) {
    if (error.isTtyError) {
      console.error("Prompt couldn't be rendered in the current environment.");
    }
    throw error;
  }
}

async function main() {
  try {
    clear();
    showHelloMessage();

    const { kibanaConfig, kibanaConfigPath, certsFolder } = await askForConfiguration();
    writeTLSCertificates(certsFolder);
    writeKibanaConfig({ kibanaConfig, kibanaConfigPath });

    showSuccessMessage({ kibanaConfigPath });
  } catch (error) {
    console.error(error);
  }
}

main();
