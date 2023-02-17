/* eslint-disable @osd/eslint/require-license-header */
import { ConfigService } from './config_service';

describe('ConfigService', () => {
  test('can get config on path', () => {
    const configService = new ConfigService({
      eliatra: {
        security: {
          cookies: {
            password: 'password',
          },
        }
      },
    });

    expect(configService.get('eliatra.security.cookies.password')).toBe('password');
  });

  test('fail to get config on path', () => {
    const configService = new ConfigService({});

    expect(configService.get('eliatra.security.cookies.password')).toBe(undefined);
  });

  test('set a default value if fail to get config on path', () => {
    const configService = new ConfigService({});

    expect(configService.get('eliatra.security.cookies.password', 'password')).toBe('password');
  });

  test('the config is immutable', () => {
    const configService = new ConfigService({ a: 1, b: { c: 2 } });

    let config = configService.getConfig();
    config.a = 2;

    expect(configService.config).toEqual({ a: 1, b: { c: 2 } });

    config = configService.get('b');
    config.c = 1;

    expect(configService.config).toEqual({ a: 1, b: { c: 2 } });
  });

  test('set config', () => {
    const configService = new ConfigService({ a: 1, b: { c: 2 } });
    configService.set('b.c', 3);

    expect(configService.config).toEqual({ a: 1, b: { c: 3 } });
  });

  describe('security config', () => {
    test('get config', () => {
      const configService = new ConfigService({ a: 1, eliatra: { security: { c: 2 } } });

      expect(configService.getEliatrasuiteConfig('c')).toEqual(2);
    });

    test('set config', () => {
      const configService = new ConfigService({ a: 1, eliatra: { security: { c: 2 } } });
      configService.setEliatrasuiteConfig('c', 3);

      expect(configService.config).toEqual({ a: 1, eliatra: { security: { c: 3 } } });
    });

    test('throw error if wrong path', () => {
      const configService = new ConfigService({ a: 1, eliatrasuite: { c: 2 } });

      expect(() => configService.setEliatrasuiteConfig('eliatra.c', 3)).toThrow(
        new Error('The path must not start with "eliatra".')
      );
    });
  });
});
