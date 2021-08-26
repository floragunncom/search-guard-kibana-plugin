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
    this.loadBalancerURL = this.config.get('server.publicBaseUrl') || this.config.get('searchguard.frontend_base_url') || this.config.get('searchguard.basicauth.loadbalancer_url');

    /**
     * Allow anonymous access?
     * @type {boolean}
     */
    this.anonymousAuthEnabled = this.config.get('searchguard.auth.anonymous_auth_enabled');
  }

  async getRedirectTargetForUnauthenticated(request, error = null, isAJAX = false) {
    const url = new URL(request.url.href);
    let appRoot = path.posix.join(this.basePath, APP_ROOT);

    if (!isAJAX) {
      url.searchParams.set('nextUrl', this.getNextUrl(request));
      // Delete sg_tenant because we have it already as a param in the nextUrl
      url.searchParams.delete('sg_tenant');
    }

    if (error && error instanceof MissingRoleError) {
      url.searchParams.set('type', 'missingRole');
      url.pathname = path.posix.join(appRoot, '/customerror');
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
