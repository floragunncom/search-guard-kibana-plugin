/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2018 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import AuthType from '../AuthType';
import MissingTenantError from '../../errors/missing_tenant_error';
import AuthenticationError from '../../errors/authentication_error';
import MissingRoleError from '../../errors/missing_role_error';
import path from 'path';
import { AUTH_TYPE_NAMES } from '../../AuthManager';
import { defineRoutes, SAML_ROUTES } from './routes';

export default class Saml extends AuthType {
  constructor({
    searchGuardBackend,
    kibanaCore,
    config,
    logger,
    sessionStorageFactory,
    pluginDependencies,
  }) {
    super({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
      pluginDependencies,
    });

    /**
     * The authType is saved in the auth cookie for later reference
     * @type {string}
     */
    this.type = AUTH_TYPE_NAMES.SAML;

    /**
     * If a loginURL is defined, we can skip the auth selector page
     * if the customer only has one auth type enabled.
     * @type {string|null}
     */
    this.loginURL = SAML_ROUTES.LOGIN;

    this.routesToIgnore = [
      ...this.routesToIgnore,
      '/searchguard/saml/acs',
      '/searchguard/saml/acs/idpinitiated',
      '/searchguard/saml/logout',
    ];
  }

  debugLog(message, label = AUTH_TYPE_NAMES.SAML) {
    super.debugLog(message, label);
  }

  async authenticate(credentials, options, additionalAuthHeaders = {}) {
    // A "login" can happen when we have a token (as header or as URL parameter but no session,
    // or when we have an existing session, but the passed token does not match what's in the session.
    try {
      this.debugLog('Authenticating using ' + credentials.authHeaderValue);
      const sessionResponse = await this.searchGuardBackend.authenticateWithSession(credentials);
      const sessionCredentials = {
        authHeaderValue: 'Bearer ' + sessionResponse.token,
      };
      const user = await this.searchGuardBackend.authenticateWithHeader(
        this.authHeaderName,
        sessionCredentials.authHeaderValue,
        additionalAuthHeaders
      );

      // @todo CLEAN UP THIS PART WHEN COOKIE VALIDATION IS CLEAR, MOST LIKELY NOT NEEDED ANYMORE.
      // @todo Pending cooke validation / expiration
      let tokenPayload = {};
      try {
        tokenPayload = JSON.parse(
          Buffer.from(credentials.authHeaderValue.split('.')[1], 'base64').toString()
        );
      } catch (error) {
        // Something went wrong while parsing the payload, but the user was authenticated correctly.
      }

      const session = {
        username: user.username,
        // The session token
        credentials: sessionCredentials,
        authType: this.type,
        authTypeId: credentials.id,
      };

      if (tokenPayload.exp) {
        // The token's exp value trumps the config setting
        this.sessionKeepAlive = false;
        session.exp = parseInt(tokenPayload.exp, 10);
      } else if (this.sessionTTL) {
        session.expiryTime = Date.now() + this.sessionTTL;
      }

      return {
        session,
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  getRedirectTargetForUnauthenticated(request, error = null, isAJAX = false) {
    const url = new URL(request.url.href, 'http://abc');
    url.pathname = path.posix.join(this.basePath, '/customerror');

    if (error instanceof MissingTenantError) {
      url.searchParams.set('type', 'missingTenant');
    } else if (error instanceof MissingRoleError) {
      url.searchParams.set('type', 'missingRole');
    } else if (error instanceof AuthenticationError) {
      url.searchParams.set('type', 'authError');
    } else {
      if (!isAJAX) {
        url.searchParams.set('nextUrl', this.getNextUrl(request));
        // Delete sg_tenant because we have it already as a param in the nextUrl
        url.searchParams.delete('sg_tenant');
      }

      url.pathname = path.posix.join(this.basePath, '/auth/saml/login');
    }

    return url.pathname + url.search + url.hash;
  }

  onUnAuthenticated(request, response, toolkit, error) {
    if (error) {
      this.logger.error(`SAML on unauthenticated: ${error} ${error.stack}`);
    }

    const redirectTo = this.getRedirectTargetForUnauthenticated(request, error);

    return response.redirected({ headers: { location: redirectTo } });
  }

  setupRoutes() {
    defineRoutes({
      authInstance: this,
      searchGuardBackend: this.searchGuardBackend,
      kibanaCore: this.kibanaCore,
      debugLog: this.debugLog.bind(this),
      sessionStorageFactory: this.sessionStorageFactory,
      logger: this.logger,
      configService: this.config,
    });
  }

  async logout({ context = null, request, response }) {
    // @todo Auth error isn't the best message for this. We still
    // get logged out from Kibana, but the IdP logout may fail.
    let redirectURL = `${this.basePath}/customerror?type=samlAuthError`;
    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};

    const authHeader = this.getAuthHeader(sessionCookie);
    console.log('Hmmmmm', {
      authHeader,
      sessionCookie
    })
    // Clear the cookie credentials
    await this.clear(request, true);
    try {
      const authInfo = await this.searchGuardBackend.authinfo(authHeader);
      redirectURL =
        authInfo.sso_logout_url || this.basePath + '/login?type=' + this.type + 'Logout';
    } catch (error) {
      this.logger.error(
        `SAML auth logout failed while retrieving the sso_logout_url: ${error.stack}`
      );
    }

    return response.ok({
      body: {
        authType: this.type,
        redirectURL,
      },
    });
  }
}
