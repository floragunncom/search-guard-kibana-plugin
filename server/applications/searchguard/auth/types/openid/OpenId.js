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
import { defineRoutes, getBaseRedirectUrl, getOIDCWellKnown, OIDC_ROUTES } from './routes';
import path from 'path';
import { AUTH_TYPE_NAMES } from '../../AuthManager';

export default class OpenId extends AuthType {
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
    this.type = AUTH_TYPE_NAMES.OIDC;

    /**
     * If a loginURL is defined, we can skip the auth selector page
     * if the customer only has one auth type enabled.
     * @type {string|null}
     */
    this.loginURL = OIDC_ROUTES.LOGIN;

    try {
      this.authHeaderName = this.config.get('searchguard.openid.header').toLowerCase();
    } catch (error) {
      this.logger.warn('No authorization header name defined for OpenId, using "authorization"');
      this.authHeaderName = 'authorization';
    }
  }

  debugLog(message, label = 'openid') {
    super.debugLog(message, label);
  }

  async authenticate(credentials, options = {}, additionalAuthHeaders = {}) {
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

    // If we don't have any tenant we need to show the custom error page
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
      url.pathname = path.posix.join(this.basePath, '/auth/openid/encode');
    }

    return url.pathname + url.search + url.hash;
  }

  onUnAuthenticated(request, response, toolkit, error) {
    const redirectTo = this.getRedirectTargetForUnauthenticated(request, error);
    return response.redirected({
      headers: {
        location: `${redirectTo}`,
      },
    });
  }

  setupRoutes() {
    defineRoutes({
      authInstance: this,
      kibanaCore: this.kibanaCore,
      kibanaConfig: this.config,
      logger: this.logger,
      debugLog: this.debugLog.bind(this),
      searchGuardBackend: this.searchGuardBackend,
    });
  }

  // @todo Pending changes in the source branch
  async logout({ context = null, request, response }) {
    const basePath = this.kibanaCore.http.basePath.serverBasePath;
    let openIdEndPoints = {};
    try {
      openIdEndPoints = await getOIDCWellKnown({ searchGuardBackend: this.searchGuardBackend });
    } catch (error) {
      this.logger.error(
        `Error when trying to retrieve the well-known endpoints from your IdP: ${error.stack}`
      );
    }
    // Build the redirect uri needed by the provider
    const baseRedirectUrl = getBaseRedirectUrl({
      kibanaCore: this.kibanaCore,
      config: this.config,
    });

    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};

    // Clear the cookie credentials
    await this.clear(request, true);

    const requestQueryParameters = `?post_logout_redirect_uri=${baseRedirectUrl}${basePath}/app/home`;

    // If we don't have an "end_session_endpoint" in the .well-known list,
    // we may have a custom logout_url defined in the config.
    // The custom url trumps the .well-known endpoint if both are available.
    const customLogoutUrl = this.config.get('searchguard.openid.logout_url');
    let endSessionUrl = null;
    if (customLogoutUrl) {
      // Pass the post_logout_uri just in case, but not the token
      endSessionUrl = customLogoutUrl + requestQueryParameters;
    } else if (openIdEndPoints.end_session_endpoint) {
      endSessionUrl = openIdEndPoints.end_session_endpoint + requestQueryParameters;

      // Pass the token to the IdP when logging out (id_token_hint)
      try {
        let idTokenHint = '';
        if (sessionCookie.credentials && sessionCookie.credentials.authHeaderValue) {
          idTokenHint = sessionCookie.credentials.authHeaderValue.split(' ')[1];
          endSessionUrl = endSessionUrl + '&id_token_hint=' + idTokenHint;
        }
      } catch (error) {
        this.logger.info('Could not add the id_token_hint to the logout url');
      }
    }

    return response.ok({
      body: {
        authType: this.type,
        redirectURL: endSessionUrl,
      },
    });
  }
}
