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
import { defineRoutes } from './routes';
import { stringify } from 'querystring';

const Wreck = require('wreck');
const https = require('https');
const fs = require('fs');

export default class OpenId extends AuthType {
  constructor({
    searchGuardBackend,
    kibanaCore,
    config,
    logger,
    sessionStorageFactory,
    elasticsearch,
    pluginDependencies,
  }) {
    super({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
      elasticsearch,
      pluginDependencies,
    });

    /**
     * The authType is saved in the auth cookie for later reference
     * @type {string}
     */
    this.type = 'openid';

    // support for self signed certificates: root ca and verify hostname
    const options = {};

    if (this.config.get('searchguard.openid.root_ca')) {
      options.ca = [fs.readFileSync(this.config.get('searchguard.openid.root_ca'))];
    }

    if (this.config.get('searchguard.openid.verify_hostnames') == false) {
      // do not check identity
      options.checkServerIdentity = function (host, cert) {};
    }

    if (options.ca || options.checkServerIdentity) {
      Wreck.agents.https = new https.Agent(options);
    }

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
    const queryParamsObject = {};
    let redirectTo = this.basePath + '/customerror';
    // If we don't have any tenant we need to show the custom error page
    if (error instanceof MissingTenantError) {
      queryParamsObject.type = 'missingTenant';
    } else if (error instanceof MissingRoleError) {
      queryParamsObject.type = 'missingRole';
    } else if (error instanceof AuthenticationError) {
      queryParamsObject.type = 'authError';
    } else {
      if (!isAJAX) {
        queryParamsObject.nextUrl = this.getNextUrl(request);
      }
      redirectTo = `${this.basePath}/auth/openid/login`;
    }

    const queryParameterString = stringify(queryParamsObject);
    return queryParameterString ? `${redirectTo}?${queryParameterString}` : `${redirectTo}`;
  }

  onUnAuthenticated(request, response, toolkit, error) {
    const redirectTo = this.getRedirectTargetForUnauthenticated(request, error);

    return response.redirected({
      headers: {
        location: `${redirectTo}`,
      },
    });
  }

  async setupRoutes() {
    try {
      const { payload } = await Wreck.get(this.config.get('searchguard.openid.connect_url'));

      const parsedPayload = JSON.parse(payload.toString());

      const endPoints = {
        authorization_endpoint: parsedPayload.authorization_endpoint,
        token_endpoint: parsedPayload.token_endpoint,
        end_session_endpoint: parsedPayload.end_session_endpoint || null,
      };

      defineRoutes({
        authInstance: this,
        kibanaCore: this.kibanaCore,
        kibanaConfig: this.config,
        logger: this.logger,
        openIdEndPoints: endPoints,
        debugLog: this.debugLog.bind(this),
        Wreck,
      });
    } catch (error) {
      if (error || error.output.statusCode < 200 || error.output.statusCode > 299) {
        throw new Error('Failed when trying to obtain the endpoints from your IdP');
      }
    }
  }
}