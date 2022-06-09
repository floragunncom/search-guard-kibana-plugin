/* eslint-disable @osd/eslint/require-license-header */
//import Statehood from 'statehood';

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
    sameSite: configService.get('searchguard.cookie.isSameSite'),
  };

  //if (configService.get('searchguard.cookie.domain')) {
  //  options.domain = configService.get('searchguard.cookie.domain');
  //}

  return options;
}

export function extendSecurityCookieOptions(options) {
  /*  
  const { domain, ttl } = options;
  // https://github.com/hapijs/statehood/blob/master/lib/index.js#L442
  const origPrepareValue = Statehood.prepareValue;

  Statehood.prepareValue = function (name, value, origOptions) {
    if (name === options.name) {
      origOptions.domain = domain;
      // Converting 0 to null for backward compatibility.
      // Statehood handles 0 "correctly" and sets the ttl to 0ms as opposed to
      // hapi-auth-cookie, which for 0 sets the ttl to browser session.
      // However, setting ttl to 0 milliseconds would render the cookie invalid immediately
      // https://github.com/hapijs/cookie/blob/v9.0.0/lib/index.js#L110
      origOptions.ttl = ttl === 0 ? null : ttl;
    }

    return origPrepareValue(name, value, origOptions);
  };*/
}
