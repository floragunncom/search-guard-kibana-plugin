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
import MissingRoleError from '../../errors/missing_role_error';
import { defineRoutes } from './routes';
import { APP_ROOT } from '../../../../../utils/constants';
import path from 'path';
import { AUTH_TYPE_NAMES } from '../../AuthManager';

export default class BasicAuth extends AuthType {
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
    this.type = AUTH_TYPE_NAMES.BASIC;

    /**
     * The name of the authorization header to be used
     * @type {string}
     */
    this.authHeaderName = 'authorization';

    /**
     * Redirect to a loadbalancer url instead of a relative path when unauthenticated?
     * @type {boolean}
     */
    this.loadBalancerURL = this.config.get('searchguard.basicauth.loadbalancer_url');

    /**
     * Allow anonymous access?
     * @type {boolean}
     */
    this.anonymousAuthEnabled = this.config.get('searchguard.auth.anonymous_auth_enabled');

  }


  /**
   * Checks if we have an authorization header.
   *
   * Pass the existing session credentials to compare with the authorization header.
   *
   * @param request
   * @param sessionCredentials
   * @returns {object|null} - credentials for the authentication
   */
  detectAuthHeaderCredentials(request, sessionCredentials = null) {
    if (request.headers[this.authHeaderName]) {
      const authHeaderValue = request.headers[this.authHeaderName];
      const headerTrumpsSession = this.config.get('searchguard.basicauth.header_trumps_session');

      // If we have sessionCredentials AND auth headers we need to check if they are the same.
      if (sessionCredentials !== null && sessionCredentials.authHeaderValue === authHeaderValue) {
        // The auth header credentials are the same as those in the session,
        // no need to return new credentials so we're just nulling the token here
        return null;
      }

      // We may have an auth header for a different user than the user saved in the session.
      // To avoid confusion, we do NOT override the cookie user, unless explicitly configured to do so.
      if (sessionCredentials !== null && !headerTrumpsSession) {
        return null;
      }

      return {
        authHeaderValue: authHeaderValue,
      };
    }

    return null;
  }

  getRedirectTargetForUnauthenticated(request, error = null, isAJAX = false) {
    let url = new URL(request.url.href, 'http://abc');
    const appRoot = path.posix.join(this.basePath, APP_ROOT);

    if (!isAJAX) {
      url.searchParams.set('nextUrl', this.getNextUrl(request));
      // Delete sg_tenant because we have it already as a param in the nextUrl
      url.searchParams.delete('sg_tenant');
    }

    if (error && error instanceof MissingRoleError) {
      url.searchParams.set('type', 'missingRole');
      url.pathname = path.posix.join(appRoot, '/customerror');
    } else if (this.anonymousAuthEnabled) {
      url.pathname = path.posix.join(appRoot, '/auth/anonymous');
    } else if (this.loadBalancerURL) {
      url = new URL(path.posix.join(appRoot, '/login'), this.loadBalancerURL);
    } else {
      url.pathname = path.posix.join(appRoot, '/login');
    }

    return url.pathname + url.search + url.hash;
  }

  setupRoutes() {
    defineRoutes({
      authInstance: this,
      searchGuardBackend: this.searchGuardBackend,
      kibanaCore: this.kibanaCore,
      kibanaConfig: this.config,
      sessionStorageFactory: this.sessionStorageFactory,
      logger: this.logger,
    });
  }
}
