/*
 *    Copyright 2021 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import AuthType from '../AuthType';
import MissingTenantError from '../../errors/missing_tenant_error';
import AuthenticationError from '../../errors/authentication_error';
import MissingRoleError from '../../errors/missing_role_error';
import { defineRoutes, OIDC_ROUTES } from './routes';
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
    spacesService,
  }) {
    super({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
      pluginDependencies,
      spacesService,
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
  }


  async getRedirectTargetForUnauthenticated(request, error = null, isAJAX = false, sessionCookie = {}) {
    const url = new URL(request.url.href);
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

      url.searchParams.set('configAuthTypeId', sessionCookie.authTypeId || null);
      url.pathname = path.posix.join(this.basePath, this.loginURL);
    }

    return url.pathname + url.search + url.hash;
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

  /**
   * Clears the session and logs the user out from the IdP (if we have an endpoint available)
   * @url http://openid.net/specs/openid-connect-session-1_0.html#RPLogout
   * @param context
   * @param request
   * @param response
   * @returns {Promise<*>}
   */
  async logout({ context = null, request, response }) {
    // @todo Auth error isn't the best message for this. We still
    // get logged out from Kibana, but the IdP logout may fail.
    let redirectURL = `${this.basePath}/customerror?type=authError`;
    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    const authHeader = this.getAuthHeader(sessionCookie);
    try {
      const authInfo = await this.searchGuardBackend.authinfo(authHeader);
      // sso_logout_url doesn't always exist
      redirectURL =
        authInfo.sso_logout_url || this.basePath + '/login?type=' + this.type + 'Logout';
    } catch (error) {
      this.logger.error(
        `OIDC auth logout failed while retrieving the sso_logout_url: ${error.stack}`
      );
    }

    // Clear the cookie credentials
    await this.clear(request, true);

    return response.ok({
      body: {
        authType: this.type,
        redirectURL,
      },
    });
  }
}
