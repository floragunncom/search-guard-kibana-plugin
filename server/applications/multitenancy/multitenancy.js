/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2020 floragunn GmbH

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

import { first } from 'rxjs/operators';
import { TenantsMigrationService } from './tenants_migration_service';
import { defineMultitenancyRoutes } from './routes';
import { requestHeaders } from './request_headers';

export class Multitenancy {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('multitenancy');
    this.tenantsMigration = new TenantsMigrationService(coreContext);
  }

  async setup({
    hapiServer,
    searchGuardBackend,
    elasticsearch,
    config,
    authInstance,
    router,
    spacesPlugin = null,
  }) {
    this.logger.info('Setup app');

    try {
      const esConfig = await this.coreContext.configService
        .atPath('elasticsearch')
        .pipe(first())
        .toPromise();

      if (!esConfig.requestHeadersWhitelist.includes('sgtenant')) {
        throw new Error(
          'No tenant header found in whitelist. Please add sgtenant to elasticsearch.requestHeadersWhitelist in kibana.yml'
        );
      }

      defineMultitenancyRoutes({ server: hapiServer, searchGuardBackend, config });

      requestHeaders({
        server: hapiServer,
        searchGuardBackend,
        authInstance,
        config,
        elasticsearch,
        spacesPlugin,
      });

      const preferenceCookieConf = {
        ttl: 2217100485000,
        path: '/',
        isSecure: false,
        isHttpOnly: false,
        clearInvalid: true, // remove invalid cookies
        strictHeader: true, // don't allow violations of RFC 6265
        encoding: 'iron',
        password: config.get('searchguard.cookie.password'),
        isSameSite: config.get('searchguard.cookie.isSameSite'),
      };

      if (config.get('searchguard.cookie.domain')) {
        preferenceCookieConf.domain = config.get('searchguard.cookie.domain');
      }

      hapiServer.state(
        config.get('searchguard.cookie.preferences_cookie_name'),
        preferenceCookieConf
      );

      await this.tenantsMigration.setup({ searchGuardBackend, elasticsearch, router });
    } catch (error) {
      this.logger.error(`setup: ${error.toString()} ${error.stack}`);
      throw error;
    }
  }

  async start(savedObjects) {
    this.logger.info('Start app');

    try {
      await this.tenantsMigration.start(savedObjects);
    } catch (error) {
      this.logger.error(`start: ${error.toString()} ${error.stack}`);
      throw error;
    }
  }
}
