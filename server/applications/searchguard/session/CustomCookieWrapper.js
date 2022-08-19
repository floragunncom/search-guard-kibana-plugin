export function getSessionCookieOptions(configService, basePath) {
  const ttlConfig = configService.get('searchguard.cookie.ttl');
  const ttl = (ttlConfig === 0) ? null : ttlConfig;
  const options = {
    ignoreErrors: true,
    password: configService.get('searchguard.cookie.password'),
    isSecure: configService.get('searchguard.cookie.secure'),
    isSameSite: configService.get('searchguard.cookie.isSameSite'),
    clearInvalid: false,
    isHttpOnly: true,
    // Converting 0 to null for backward compatibility.
    // Statehood handles 0 "correctly" and sets the ttl to 0ms as opposed to
    // hapi-auth-cookie, which for 0 sets the ttl to browser session.
    // However, setting ttl to 0 milliseconds would render the cookie invalid immediately
    // https://github.com/hapijs/cookie/blob/v9.0.0/lib/index.js#L110
    ttl,
    // @todo Compare with defaults for hapi auth cookie
    encoding: 'iron',

    path: basePath || '/',
    // @todo hapi-auth-cookie used to handle this for us
    //keepAlive: (ttl !== null && ttl >= 1) ? true : false,
  }

  if (configService.get('searchguard.cookie.domain')) {
    options.domain = configService.get('searchguard.cookie.domain');
  }

  return options;
}

export class CustomCookieWrapper {
  constructor(statehoodDefinitions, request, cookieName, options) {
    this.statehoodDefinitions = statehoodDefinitions;
    this.request = request;
    this.cookieName = cookieName;
    this.options = options;
  }

  async get() {
    let cookie = null
    if (this.request.headers.cookie) {
      // Could probably use this.request.state as well
      const parsed = await this.statehoodDefinitions.parse(this.request.headers.cookie);
      if (parsed.states[this.cookieName]) {
        cookie = parsed.states[this.cookieName];
      }
    }

    return cookie;
  }

  set(value) {
    // Options are needed here because we unfortunately have to use a different
    // instance of Statehood.Definitions when setting the cookie than when reading.
    return this.request.cookieAuth.h.state(this.cookieName, value, this.options);
  }

  clear() {
    return this.request.cookieAuth.h.unstate(this.cookieName);
  }
}
