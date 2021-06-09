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
import { APP_ROOT } from '../../../../../utils/constants';
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
    //this.loginURL = SAML_ROUTES.LOGIN;

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
      const user = await this.searchGuardBackend.authenticateWithHeader(
        this.authHeaderName,
        credentials.authHeaderValue,
        additionalAuthHeaders
      );

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
        credentials: credentials,
        authType: this.type,
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
    try {
      const sessionCookie = await this.sessionStorageFactory.asScoped(request).get();
      if (!sessionCookie || !sessionCookie.credentials) {
        throw new Error('The session cookie or credentials is absent.');
      }
      /*
      When logging in,
      sessionCookie = {
        username: 'admin',
        credentials: {
          authHeaderValue: 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE2MDEw...'
        },
        authType: 'saml',
        exp: 1601046190,
        additionalAuthHeaders: null
      }
      */

      // @todo This should probably use all authHeaders instead
      const authHeader = {
        [this.authHeaderName]: sessionCookie.credentials.authHeaderValue,
      };

      const authInfo = await this.searchGuardBackend.authinfo(authHeader);
      /*
      When logging in,
      authInfo = {
        user: 'User [name=admin, backend_roles=[manage-account, ...], requestedTenant=null]',
        ...,
        sso_logout_url: 'http://keycloak.example.com:8080/auth/realms/master/protocol/saml?SAMLRequest=fVLRatwwEPwVo3edZdmKbXFnKF...'
      }
      */

      await this.clear(request, true);

      if (authInfo && authInfo.sso_logout_url) {
        return response.ok({
          body: {
            authType: this.type,
            redirectURL: authInfo.sso_logout_url,
          },
        });
      }

      // @todo Why do we repeat this?
      const redirectURL =
        authInfo && authInfo.sso_logout_url
          ? authInfo.sso_logout_url
          : `${APP_ROOT}/customerror?type=samlLogoutSuccess`;

      // The logout procedure:
      // 1. Logout from IDP.
      // 2. Logout from Kibana.
      return response.ok({
        body: {
          authType: this.type,
          redirectURL,
        },
      });
    } catch (error) {
      this.logger.error(`SAML auth logout: ${error.stack}`);

      // The authenticated user is redirected back to Kibana home if his session is still active on IDP.
      // For some reason, response.redirected() doesn't pass query params to the customerror page here.
      // @todo Customerror still available?
      return response.ok({
        body: {
          redirectURL: `${this.basePath}/customerror?type=samlAuthError`,
        },
      });
    }
  }
}
