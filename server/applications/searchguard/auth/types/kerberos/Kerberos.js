/*
 *    Copyright 2020 floragunn GmbH
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

import { KibanaResponse } from '../../../../../../../../src/core/server/http/router/response';

export const WWW_AUTHENTICATE_HEADER_NAME = 'WWW-Authenticate';

export class Kerberos {
  constructor(props) {
    this.type = 'kerberos';
    this.logger = props.logger;
    this.config = props.config;
    this.searchGuardBackend = props.searchGuardBackend;
    this.authDebugEnabled = this.config.get('searchguard.auth.debug');
  }

  // See the Negotiate Operation Example for the authentication flow details
  // https://tools.ietf.org/html/rfc4559#section-5
  async authenticateWithSPNEGO(request, response, toolkit) {
    let backendError;

    try {
      const whitelistRoutes = this.config.get('searchguard.auth.unauthenticated_routes');
      if (whitelistRoutes.includes(request.route.path)) {
        return toolkit.authenticated();
      }

      const headers = {};
      if (request.headers.authorization) {
        headers.authorization = request.headers.authorization;
      }

      // Validate the request.
      // The headers.authorization may hold SPNEGO GSSAPI token or basic auth credentials.
      const authInfo = await this.searchGuardBackend.authenticateWithHeaders(headers);

      if (this.authDebugEnabled) {
        this.logger.debug(`Authenticated: ${JSON.stringify(authInfo, null, 2)}.`);
      }

      return toolkit.authenticated();
    } catch (error) {
		backendError = error.inner || error;

		if (request.route.path === '/api/core/capabilities') {
			return new KibanaResponse(307, undefined, {
				headers: { location: this.basePath + '/api/v1/searchguard/kibana_capabilities' },
			});
		}

		if (backendError && backendError.meta && backendError.meta.headers["www-authenticate"]) {
			let authenticateHeader = backendError.meta.headers["www-authenticate"];
			let parts = authenticateHeader.split(/\s*,\s*/);

			for (let negotiationProposal of parts) {
				if (negotiationProposal.startsWith('Negotiate')) {
					return response.unauthorized({
						headers: {
							[WWW_AUTHENTICATE_HEADER_NAME]: negotiationProposal,
						},
					});
				}
			}
		}



		return response.unauthorized({ body: backendError });
	  }

  }

  checkAuth = async (request, response, toolkit) => {
    return this.authenticateWithSPNEGO(request, response, toolkit);
  };
}
