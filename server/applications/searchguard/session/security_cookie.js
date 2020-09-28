/* eslint-disable @kbn/eslint/require-license-header */
import Statehood from 'statehood';

export function getSecurityCookieOptions(configService) {
  const options = {
    encryptionKey: configService.get('searchguard.cookie.password'),
    name: configService.get('searchguard.cookie.name'),
    isSecure: configService.get('searchguard.cookie.secure'),
    // This cookie validation is taken care of by the AuthType.
    // We can't omit this though, because Kibana seems to
    // wrap it somehow
    validate: () => {
      return { isValid: true };
    },
    clearInvalid: true,
    ttl: configService.get('searchguard.cookie.ttl'),
    isSameSite: configService.get('searchguard.cookie.isSameSite'),
  };

  if (configService.get('searchguard.cookie.domain')) {
    options.domain = configService.get('searchguard.cookie.domain');
  }

  return options;
}

export function extendSecurityCookieOptions(options) {
  const { domain, ttl, isSameSite } = options;
  // https://github.com/hapijs/statehood/blob/master/lib/index.js#L442
  const origPrepareValue = Statehood.prepareValue;

  Statehood.prepareValue = function (name, value, origOptions) {
    if (name === options.name) {
      origOptions.domain = domain;
      origOptions.ttl = ttl;
      origOptions.isSameSite = isSameSite;
    }

    return origPrepareValue(name, value, origOptions);
  };
}
