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
  // The function must be fast enough to avoid braking Kibana's limit of 10 seconds
  // for a plugin lifecycle method (setup, start or stop)
  test('can parse a big deeply nested config in less then 0.9 seconds', () => {
    let kibanaConfig = '';
    const timeLimit = 900;
    const numOfLines = 2000;
    const a = 97;
    const z = 122;

    for (let i = 0; i < numOfLines; i++) {
      let key = '';
      for (let j = a; j <= z; j++) {
        const end = j < z ? '.' : ':';
        key += String.fromCharCode(j) + i + end;
      }

      kibanaConfig += `${key} ${i}\n`;
    }

    const time0 = new Date().getTime();
    parseKibanaConfig(kibanaConfig);
    const time1 = new Date().getTime();

    expect(time1 - time0).toBeLessThan(timeLimit);
  });

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
    expect(parseKibanaConfig('')).toEqual(DEFAULT_CONFIG);
  });
});
