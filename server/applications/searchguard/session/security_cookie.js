/* eslint-disable @kbn/eslint/require-license-header */
export function getSecurityCookieOptions(configService) {
  const options = {
    encryptionKey: configService.get('searchguard.cookie.password'),
    name: configService.get('searchguard.cookie.name'),
    isSecure: configService.get('searchguard.cookie.secure'),
    //validateFunc: this.sessionValidator(this.server),
    validate: () => {
      // @todo Just implement our own validation function again
      return { isValid: true, path: '/' };
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
