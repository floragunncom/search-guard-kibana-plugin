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
import MissingTenantError from "../../errors/missing_tenant_error";
import InvalidSessionError from "../../errors/invalid_session_error";
import SessionExpiredError from "../../errors/session_expired_error";
import AuthenticationError from "../../errors/authentication_error";

export default class Kerberos extends AuthType {

    constructor(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

        super(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT);

        /**
         * The authType is saved in the auth cookie for later reference
         * @type {string}
         */
        this.type = 'kerberos';

        /**
         * The name of the authorization header to be used
         * @type {string}
         */
        this.authHeaderName = 'authorization';

    }

    /**
     * Checks if we have an authorization header.
     *
     * For Kerberos, we do NOT check if the token is the same as the one we already have in the cookie
     *
     * @param request
     * @param sessionCredentials
     * @returns {object|null} - credentials for the authentication
     */
    detectAuthHeaderCredentials(request, sessionCredentials = null) {

        if (request.headers[this.authHeaderName]) {
            const authHeaderValue = request.headers[this.authHeaderName];

            // For Kerberos the ticket will always be different to what we have in the session,
            // so we always return whatever we have in the auth header value

            return {
                authHeaderValue: authHeaderValue
            }
        }

        return null;
    }

    async authenticate(credentials) {
        // A "login" can happen when we have a token (as header or as URL parameter but no session,
        // or when we have an existing session, but the passed token does not match what's in the session.
        try {
            let user = await this.server.plugins.searchguard.getSearchGuardBackend().authenticateWithHeader(this.authHeaderName, credentials.authHeaderValue);
            let tokenPayload = {};
            try {
                tokenPayload = JSON.parse(Buffer.from(credentials.authHeaderValue.split('.')[1], 'base64').toString());
            } catch (error) {
                // Something went wrong while parsing the payload, but the user was authenticated correctly.
            }

            let session = {
                username: user.username,
                credentials: credentials,
                authType: this.type
            };

            if (tokenPayload.exp) {
                // The token's exp value trumps the config setting
                this.sessionKeepAlive = false;
                session.exp = parseInt(tokenPayload.exp, 10);
            } else if(this.sessionTTL) {
                session.expiryTime = Date.now() + this.sessionTTL
            }

            return {
                session,
                user
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * If a session auth cookie exists, the sessionValidator is called to validate the content
     * @param server
     * @returns {validate}
     */
    sessionValidator(server) {

        let validate = async(request, session, callback) => {

            if (session.authType !== this.type) {
                return callback(new InvalidSessionError('Invalid session'), false, null);
            }

            // Check if we have auth header credentials set that are different from the session credentials
            let differentAuthHeaderCredentials = this.detectAuthHeaderCredentials(request, session.credentials);
            if (differentAuthHeaderCredentials) {
                try {
                    // Update the session with the new ticket, without calling authinfo()
                    session[this.authHeaderName] = differentAuthHeaderCredentials.authHeaderValue;
                    return callback(null, true, {credentials: session});
                } catch(error) {
                    request.auth.sgSessionStorage.clearStorage();
                    return callback(error, false);
                }
            }

            // If we are still here, we need to compare the expiration time
            // JWT's .exp is denoted in seconds, not milliseconds.
            if (session.exp && session.exp < Math.floor(Date.now() / 1000)) {
                request.auth.sgSessionStorage.clearStorage();
                return callback(new SessionExpiredError('Session expired.'), false);
            } else if (!session.exp && this.sessionTTL) {
                if (!session.expiryTime || session.expiryTime < Date.now()) {
                    request.auth.sgSessionStorage.clearStorage();
                    return callback(new SessionExpiredError('Session expired.'), false);
                }

                if (this.sessionKeepAlive) {
                    session.expiryTime = Date.now() + this.sessionTTL;
                }
            }

            // All good, return the session as it was
            return callback(null, true, {credentials: session});

        };

        return validate;
    }

    onUnAuthenticated(request, reply, error) {
        if (error instanceof MissingTenantError) {
            return reply.redirect(this.basePath + '/customerror?type=missingTenant')
        }

        return reply.continue({credentials: {}});
    }

    setupRoutes() {
        require('./routes')(this.pluginRoot, this.server, this.kbnServer, this.APP_ROOT, this.API_ROOT);
    }

    /**
     * Called on each authenticated request.
     * Used to add the credentials header to the request.
     *
     */
    assignAuthHeader() {
        this.server.ext('onPostAuth', (request, next) => {

            // MT is only relevant for these paths
            if (!request.path.startsWith("/elasticsearch") && !request.path.startsWith("/api/")) {
                return next.continue();
            }

            // If we already have an authorization header, use it instead of rewriting from the cookie
            if (request.headers && request.headers[this.authHeaderName]) {
                return next.continue();
            }

            // If we don't have an auth header, use the cookie if available
            if (request.auth.sgSessionStorage.isAuthenticated()) {
                const session = request.auth.sgSessionStorage.getSessionCredentials();
                try {
                    let authHeader = this.getAuthHeader(session);
                    if (authHeader !== false) {
                        assign(request.headers, authHeader);
                        return next.continue();
                    }
                } catch (error) {
                    this.server.log(['searchguard', 'error'], `An error occurred while computing auth headers, clearing session: ${error}`);
                    request.auth.sgSessionStorage.clear();
                    return next.redirect(this.basePath + '/customerror?type=authError');
                }
            }

            return next.continue();
        });
    }
}