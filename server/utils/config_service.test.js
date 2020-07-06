/* eslint-disable @kbn/eslint/require-license-header */
import { ConfigService } from './config_service';

describe('ConfigService', () => {
  test('can get config on path', () => {
    const configService = new ConfigService({
      searchguard: {
        cookies: {
          password: 'password',
        },
      },
    });

    expect(configService.get('searchguard.cookies.password')).toBe('password');
  });

  test('fail to get config on path', () => {
    const configService = new ConfigService({});

    expect(configService.get('searchguard.cookies.password')).toBe(undefined);
  });

  test('set a default value if fail to get config on path', () => {
    const configService = new ConfigService({});

    expect(configService.get('searchguard.cookies.password', 'password')).toBe('password');
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
});
