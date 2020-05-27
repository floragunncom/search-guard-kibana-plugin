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

import AuthType from "../AuthType";
import MissingRoleError from "../../errors/missing_role_error";

export default class BasicAuth extends AuthType {

    constructor(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {
        super(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT);

        /**
         * The authType is saved in the auth cookie for later reference
         * @type {string}
         */
        this.type = 'basicauth';

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

        this.handleUnauthenticated();
    }

    debugLog(message, label = 'basicauth') {
      super.debugLog(message, label);
    }

    /**
     * Handle the case where a logged in user's password was changed
     * and we receive a 401 despite having a valid auth cookie.
     */
    handleUnauthenticated() {

        this.server.ext('onPreResponse', (request, h) => {

            try {
                let has401 = false;
                if (request.response.statusCode === 401) {
                    has401 = true;
                } else if (request.response.output && request.response.output.statusCode === 401) {
                    has401 = true;
                }

                if (has401) {
                    // Make sure we don't have an auth cookie anymore if we receive a 401.
                    // Most likely, the current user's password was changed, leading to the 401.
                    request.auth.sgSessionStorage.clear();
                    request.auth.sgSessionStorage.clearStorage();
                    if (request.response.output && request.response.output.headers) {
                        delete request.response.output.headers['WWW-Authenticate'];
                        delete request.response.wwwAuthenticateDirective;
                    }
                    this.debugLog('Received a 401 auth exception. If we had a cookie, the password was most likely changed elsewhere', 'basicAuth');
                }
            } catch (error) {
                this.server.log(['searchguard', 'error'], `An error occurred while checking for 401 Unauthorized`);
            }



            return h.continue;
        });
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
            if (sessionCredentials !== null && ! headerTrumpsSession) {
                return null;
            }

            return {
                authHeaderValue: authHeaderValue
            }
        }

        return null;
    }

    async authenticate(credentials, options = {}, additionalAuthHeaders = {}) {

        // A login can happen via a POST request (login form) or when we have request headers with user credentials.
        // We also need to re-authenticate if the credentials (headers) don't match what's in the session.
        try {
            let user = await this.server.plugins.searchguard.getSearchGuardBackend().authenticateWithHeader(this.authHeaderName, credentials.authHeaderValue, additionalAuthHeaders);
            let session = {
                username: user.username,
                credentials: credentials,
                authType: this.type,
                isAnonymousAuth: (options && options.isAnonymousAuth === true) ? true : false
            };

            if(this.sessionTTL) {
                session.expiryTime = Date.now() + this.sessionTTL
            }

            return {
                session,
                user
            }
        } catch(error) {
            throw error;
        }
    }

    onUnAuthenticated(request, h, error) {

        if (error instanceof MissingRoleError) {
            return h.redirect(this.basePath + '/customerror?type=missingRole')
        }

        const nextUrl = this.getNextUrl(request);

        if (this.anonymousAuthEnabled) {
            return h.redirect(`${this.basePath}${this.APP_ROOT}/auth/anonymous?nextUrl=${nextUrl}`);
        }

        if (this.loadBalancerURL) {
            return h.redirect(`${this.loadBalancerURL}${this.basePath}${this.APP_ROOT}/login?nextUrl=${nextUrl}`);
        }

        return h.redirect(`${this.basePath}${this.APP_ROOT}/login?nextUrl=${nextUrl}`);
    }

    setupRoutes() {
        require('./routes')(this.pluginRoot, this.server, this.kbnServer, this.APP_ROOT, this.API_ROOT);
    }
}
