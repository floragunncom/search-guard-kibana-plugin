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

import { stringify } from 'querystring';
import { randomString } from 'cryptiles';
import {sanitizeNextUrl} from "../../sanitize_next_url";
import MissingTenantError from "../../errors/missing_tenant_error";

module.exports = async function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT, openIdEndPoints, debugLog, searchGuardBackend) {

    const AuthenticationError = pluginRoot('lib/auth/errors/authentication_error');
    const config = server.config();
    const basePath = config.get('server.basePath');
    const customErrorApp = server.getHiddenUiAppById('searchguard-customerror');

    const routesPath = '/auth/openid/';

    // OpenId config
    const clientId = config.get('searchguard.openid.client_id');
    const clientSecret = config.get('searchguard.openid.client_secret');

    // Scope must include "openid"
    // Other available scopes as per the spec: https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
    let scope = config.get('searchguard.openid.scope').split(' ');
    if (scope.indexOf('openid') === -1) {
        scope.push('openid');
    }

    /**
     * The redirect uri can't always be resolved automatically.
     * Instead, we have the searchguard.openid.base_redirect_uri config option.
     * @returns {*}
     */
    function getBaseRedirectUrl() {
        const configuredBaseRedirectUrl = config.get('searchguard.openid.base_redirect_url');
        if (configuredBaseRedirectUrl) {
            return (configuredBaseRedirectUrl.endsWith('/')) ? configuredBaseRedirectUrl.slice(0, -1) : configuredBaseRedirectUrl;
        }

        // Config option not used, try to get the correct protocol and host
        let host = config.get('server.host');
        let port = config.get('server.port');
        if (port) {
            host = host + ':' + port;
        }

        return `${server.info.protocol}://${host}`;
    }

    /**
     * Error handler for the cases where we can't catch errors while obtaining the token.
     * Mainly happens when Wreck within Bell
     */
    server.ext('onPreResponse', function(request, h) {
        // Make sure we only handle errors for the login route
        if (request.response.isBoom && request.path.indexOf(`${APP_ROOT}${routesPath}login`) > -1 && request.response.output.statusCode === 500) {
            return h.redirect(basePath + '/customerror?type=authError');
        }

        return h.continue;
    });

    let baseRedirectUrl = getBaseRedirectUrl();
    let location = `${baseRedirectUrl}${basePath}`;
    debugLog('Base redirect url: ' + location);
    const redirectUri = encodeURI(baseRedirectUrl + routesPath + 'login');

    /**
     * The login page.
     */
    server.route({
        method: ['GET', 'POST'],
        path: `${APP_ROOT}${routesPath}login`,
        options: {
            auth: false
        },
        handler: async(request, h) => {

            const authCode = request.query.code;
            // Could not find any info about length of the nonce in
            // the OpenId spec, so I went with what we had before
            // the migration.
            const nonce = randomString(22);

            if (!authCode) {
              // Build the query parameters that will be sent to the IdP
              const query = {
                  client_id: clientId,
                  response_type: 'code',
                  redirect_uri: redirectUri,
                  state: nonce,
                  scope: scope.join(' '),
              };

              request.auth.sgSessionStorage.putStorage('temp-openid', {
                  nonce,
                  nextUrl: request.query.nextUrl,
              });

                const idpAuthLocation = openIdEndPoints.authorization_endpoint + '?' + stringify(query);
                return h.redirect(idpAuthLocation);
            }

            // Start the token flow
            try {
                let storedRequestInfo = request.auth.sgSessionStorage.getStorage('temp-openid', {});
                request.auth.sgSessionStorage.clearStorage('temp-openid');

                if (! storedRequestInfo.nonce || storedRequestInfo.nonce !== request.query.state) {
                    debugLog('There was a state mismatch between the cookie and the IdP response');
                    throw new Error('There was a state mismatch between the cookie and the IdP response');
                }

                const query = {
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'authorization_code',
                    code: authCode,
                    redirect_uri: redirectUri,
                };

                let nextUrl = storedRequestInfo.nextUrl || null;

                const idpResponse = await handleIdTokenRequest({searchGuardBackend, query, openIdEndPoints});

                await request.auth.sgSessionStorage.authenticate({
                    authHeaderValue: 'Bearer ' + idpResponse['id_token']
                });

                debugLog('OpenId response token: ' + idpResponse['id_token']);

                if (nextUrl) {
                    nextUrl = sanitizeNextUrl(nextUrl, basePath);
                    return h.redirect(nextUrl);
                }

                return h.redirect(basePath + '/app/kibana');
            }
            catch (error) {
                if (error instanceof AuthenticationError) {
                    return h.redirect(basePath + '/customerror?type=authError');
                } else if (error instanceof MissingTenantError) {
                    return h.redirect(basePath + '/customerror?type=missingTenant');
                } else {
                    return h.redirect(basePath + '/customerror?type=authError');
                }
            }
        }

    });

    async function handleIdTokenRequest({searchGuardBackend, query, openIdEndPoints}) {
      // Get the necessary token from the IdP
      try {

        const idpResponse = await searchGuardBackend.getOIDCToken({
          tokenEndpoint: openIdEndPoints.token_endpoint,
          // Only "application/x-www-form-urlencoded" possible
          body: stringify(query),
        });

        if (!idpResponse.id_token) {
          throw new Error('IdP response is missing the id_token');
        }

        return idpResponse;
      } catch (error) {
        debugLog(`Error while retrieving the token from the IdP: ${error.stack}`);
        throw error;
      }
    }


    /**
     * The error page.
     */
    server.route({
        method: 'GET',
        path:  `${APP_ROOT}/customerror`,
        handler(request, h) {
            return h.renderAppWithDefaultConfig(customErrorApp);
        },
        options: {
            auth: false
        }
    });

    /**
     * Clears the session and logs the user out from the IdP (if we have an endpoint available)
     * @url http://openid.net/specs/openid-connect-session-1_0.html#RPLogout
     */
    server.route({
        method: 'POST',
        path: `${API_ROOT}/auth/logout`,
        handler: (request, h) => {
            request.auth.sgSessionStorage.clear();

            // Build the redirect uri needed by the provider
            let baseRedirectUrl = getBaseRedirectUrl();
            // Unfortunately, it seems like the cookie plugin isn't available yet,
            // which means that we can't use the new plugin
            const cookieName = config.get('searchguard.cookie.name');
            // Get the session credentials and remove "Bearer " from the value
            const token = request.state[cookieName].credentials.authHeaderValue.split(' ')[1];
            let requestQueryParameters = `?post_logout_redirect_uri=${baseRedirectUrl}${basePath}/app/kibana`;

            // If we don't have an "end_session_endpoint" in the .well-known list,
            // we may have a custom logout_url defined in the config.
            // The custom url trumps the .well-known endpoint if both are available.
            let customLogoutUrl = config.get('searchguard.openid.logout_url');
            let endSessionUrl = null
            if (customLogoutUrl) {
                // Pass the post_logout_uri just in case, but not the token
                endSessionUrl = customLogoutUrl + requestQueryParameters;
            } else if (openIdEndPoints.end_session_endpoint) {
                endSessionUrl = openIdEndPoints.end_session_endpoint + requestQueryParameters + '&id_token_hint=' + token;
            }

            return {redirectURL: endSessionUrl};
        },
        options: {
            auth: false
        }
    });

}; //end module
