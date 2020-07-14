/* eslint-disable @kbn/eslint/require-license-header */
import { defaultsDeep } from 'lodash';
import { parseKibanaConfig, nestConfigProperties, DEFAULT_CONFIG } from './read_kibana_config';

describe('nestConfigProperties', () => {
  test('can nest the config properties', () => {
    const config = {
      'server.port': 5602,
      'server.host': 'localhost',
      'a.b.c': 2,
      'a.b.d.e': 3,
      'a.b.d.f': 4,
      'a.b.d.g': [5, 6],
      'a.b.d.h': null,
    };

    const result = {
      server: {
        port: 5602,
        host: 'localhost',
      },
      a: {
        b: {
          c: 2,
          d: {
            e: 3,
            f: 4,
            g: [5, 6],
            h: null,
          },
        },
      },
    };

    expect(nestConfigProperties(config)).toEqual(result);
  });
});

describe('parseKibanaConfig', () => {
  test('fail to read the config due to a YAML error', () => {
    const kibanaConfig = `
A comment.
server.port: 5602
    `;

    const error = new Error(
      `Fail to read kibana.yml. Make sure it is correct. Error: YAMLException: end of the stream or a document separator is expected at line 3, column 12:\n    server.port: 5602\n               ^`
    );

    expect(() => parseKibanaConfig(kibanaConfig)).toThrow(error);
  });

  test('can read the config', () => {
    const kibanaConfig = `
# A comment.
server.port: 5602

# A comment.
# A comment.
server.host: "localhost"
    `;

    const config = defaultsDeep(
      {
        server: {
          port: 5602,
          host: 'localhost',
        },
      },
      DEFAULT_CONFIG
    );

    expect(parseKibanaConfig(kibanaConfig)).toEqual(config);
  });

  test('can read the dotted config properties', () => {
    const kibanaConfig = `
server.port: 5602
searchguard.multitenancy.enabled: true
searchguard.multitenancy.tenants.enable_global: false
searchguard.multitenancy.tenants.preferred: ['velociraptor', 'admin_tenant', 'Private']
    `;

    const config = defaultsDeep(
      {
        server: {
          port: 5602,
        },
        searchguard: {
          multitenancy: {
            enabled: true,
            tenants: {
              enable_global: false,
              preferred: ['velociraptor', 'admin_tenant', 'Private'],
            },
          },
        },
      },
      DEFAULT_CONFIG
    );

    expect(parseKibanaConfig(kibanaConfig)).toEqual(config);
  });

  test('can read the dotted and nested config properties', () => {
    const kibanaConfig = `
server.port: 5602
map.regionmap:
  includeElasticMapsService: false
  layers:
    - name: "Departments of France"
      url: "http://my.cors.enabled.server.org/france_departements.geojson"
      attribution: "INRAP"
      fields:
          - name: "department"
            description: "Full department name"
          - name: "INSEE"
            description: "INSEE numeric identifier"
    `;

    const config = defaultsDeep(
      {
        server: {
          port: 5602,
        },
        map: {
          regionmap: {
            includeElasticMapsService: false,
            layers: [
              {
                attribution: 'INRAP',
                fields: [
                  {
                    description: 'Full department name',
                    name: 'department',
                  },
                  {
                    description: 'INSEE numeric identifier',
                    name: 'INSEE',
                  },
                ],
                name: 'Departments of France',
                url: 'http://my.cors.enabled.server.org/france_departements.geojson',
              },
            ],
          },
        },
      },
      DEFAULT_CONFIG
    );

    expect(parseKibanaConfig(kibanaConfig)).toEqual(config);
  });

  test('ignore the commented config', () => {
    const kibanaConfig = `
#server.port: 5555
# server.host: host

searchguard.multitenancy.enabled: true
searchguard.multitenancy.tenants.enable_global: false
#searchguard.multitenancy.tenants.preferred: ['velociraptor', 'admin_tenant', 'Private']

#searchguard:
#  multitenancy:
#    enabled: false
#    animal: wolf
    `;

    const config = defaultsDeep(
      {
        searchguard: {
          multitenancy: {
            enabled: true,
            tenants: {
              enable_global: false,
            },
          },
        },
      },
      DEFAULT_CONFIG
    );

    expect(parseKibanaConfig(kibanaConfig)).toEqual(config);
  });

  test('can produce the default config', () => {
    const kibanaConfig = '';
    const config = {
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
    };

    expect(parseKibanaConfig(kibanaConfig)).toEqual(config);
  });
});
