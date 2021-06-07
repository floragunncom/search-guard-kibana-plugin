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
import SessionExpiredError from '../../errors/session_expired_error';
import MissingRoleError from '../../errors/missing_role_error';
import path from 'path';
import { AUTH_TYPE_NAMES } from '../../AuthManager';

export default class Jwt extends AuthType {
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
    this.type = AUTH_TYPE_NAMES.JWT;

    this.loginURL = null;
  }

  /*
  debugLog(message, label = AUTH_TYPE_NAMES.JWT) {
    super.debugLog(message, label);
  }

   */

  async detectCredentialsByRequest({ request }) {
    if (!this.config.get('searchguard.jwt.enabled')) {
      return null;
    }

    const urlparamname = this.config.get('searchguard.jwt.url_param').toLowerCase();

    // Go through all given query parameters and make them lowercase
    // to avoid confusion when using uppercase or perhaps mixed caps
    const lowerCaseQueryParameters = {};
    if (request.url.query) {
      Object.keys(request.url.query).forEach((query) => {
        lowerCaseQueryParameters[query.toLowerCase()] = request.url.query[query];
      });
    }

    const jwtAuthParam = lowerCaseQueryParameters[urlparamname] || null;

    if (jwtAuthParam) {
      const credentials = {
        method: 'jwt',
        jwt: jwtAuthParam,
      };

      this.debugLog('JWT from url parameter: ' + jwtAuthParam);
      return credentials;
    }

    return null;
  }

  async getRedirectTargetForUnauthenticated(request, error = null, isAJAX = false) {
    let url = new URL(request.url.href, 'http://abc');
    url.pathname = path.posix.join(this.basePath, '/customerror');

    // Missing tenant or role takes precedence
    if (error instanceof MissingTenantError) {
      url.searchParams.set('type', 'missingTenant');
    } else if (error instanceof MissingRoleError) {
      url.searchParams.set('type', 'missingRole');
    } else {
      const authConfig = (
        await this.searchGuardBackend.getAuthConfig(
          this.config.get('elasticsearch.username'),
          this.config.get('elasticsearch.password')
        )
      ).auth_methods.find((config) => config.method === 'link');

      // The customer may use a login endpoint, to which we can redirect
      // if the user isn't authenticated.
      const loginEndpoint = authConfig ? authConfig.sso_location : null;
      if (loginEndpoint) {
        try {
          const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
          // Delete this again, otherwise the user won't get back to the login page
          // if trying to access Kibana again
          delete sessionCookie.authTypeId;
          delete sessionCookie.authType;
          await this.sessionStorageFactory.asScoped(request).set(sessionCookie);

          // Parse the login endpoint so that we can append our nextUrl
          // if the customer has defined query parameters in the endpoint
          url = new URL(loginEndpoint);

          // Make sure we don't overwrite an existing "nextUrl" parameter,
          // just in case the customer is using that name for something else
          // Also, we don't want the nextUrl if this is an AJAX request.
          if (!isAJAX && !url.searchParams.has('nextUrl')) {
            url.searchParams.set('nextUrl', this.getNextUrl(request));
            // Delete sg_tenant because we have it already as a param in the nextUrl
            url.searchParams.delete('sg_tenant');
          }

          return url.toString();
        } catch (error) {
          this.logger.error(
            'An error occured while parsing the searchguard.jwt.login_endpoint value'
          );
        }
      }
    }

    return url.pathname + url.search + url.hash;
  }

  setupRoutes() {
    require('./routes')({
      authInstance: this,
      kibanaCore: this.kibanaCore,
      logger: this.logger,
    });
  }
}
