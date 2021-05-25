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
import { stringify } from 'querystring';

export default class Saml extends AuthType {
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
    this.type = 'saml';

    this.routesToIgnore = [
      ...this.routesToIgnore,
      '/searchguard/saml/acs',
      '/searchguard/saml/acs/idpinitiated',
      '/searchguard/saml/logout',
    ];
  }

  debugLog(message, label = 'saml') {
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
    // If we don't have any tenant we need to show the custom error page
    const queryParamsObject = {};
    let redirectTo = `${this.basePath}/customerror`;

    if (error instanceof MissingTenantError) {
      queryParamsObject.type = 'missingTenant';
    } else if (error instanceof MissingRoleError) {
      queryParamsObject.type = 'missingRole';
    } else if (error instanceof AuthenticationError) {
      queryParamsObject.type = 'samlAuthError';
    } else {
      if (!isAJAX) {
        queryParamsObject.nextUrl = this.getNextUrl(request);
      }
      redirectTo = `${this.basePath}/auth/saml/login`;
    }

    const queryParameterString = stringify(queryParamsObject);
    return queryParameterString ? `${redirectTo}?${queryParameterString}` : `${redirectTo}`;
  }

  onUnAuthenticated(request, response, toolkit, error) {
    if (error) {
      this.logger.error(`SAML on unauthenticated: ${error} ${error.stack}`);
    }

    const redirectTo = this.getRedirectTargetForUnauthenticated(request, error);

    return response.redirected({ headers: { location: redirectTo } });
  }

  setupRoutes() {
    require('./routes')({
      authInstance: this,
      searchGuardBackend: this.searchGuardBackend,
      kibanaCore: this.kibanaCore,
      kibanaConfig: this.config,
      debugLog: this.debugLog.bind(this),
      sessionStorageFactory: this.sessionStorageFactory,
      logger: this.logger,
    });
  }
}