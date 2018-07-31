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
import SessionExpiredError from "../../errors/session_expired_error";

export default class Jwt extends AuthType {

    constructor(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

        super(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT);

        /**
         * The authType is saved in the auth cookie for later reference
         * @type {string}
         */
        this.type = 'jwt';

        try {
            this.authHeaderName = this.config.get('searchguard.jwt.header').toLowerCase();
        } catch(error) {
            this.kbnServer.status.yellow('No authorization header name defined for JWT, using "authorization"');
            this.authHeaderName = 'authorization'
        }
    }

    /**
     * Detect authorization header value, either as an http header or as a query parameter
     * @param request
     * @param sessionCredentials
     * @returns {*}
     */
    detectAuthHeaderCredentials(request, sessionCredentials = null) {

        let authHeaderValue = null;
        const urlparamname = this.config.get('searchguard.jwt.url_param').toLowerCase();

        // Go through all given query parameters and make them lowercase
        // to avoid confusion when using uppercase or perhaps mixed caps
        let lowerCaseQueryParameters = {};
        Object.keys(request.query).forEach((query) => {
            lowerCaseQueryParameters[query.toLowerCase()] = request.query[query];
        });

        let jwtAuthParam = lowerCaseQueryParameters[urlparamname] || null;

        // The token may be passed via a query parameter
        if (jwtAuthParam != null) {
            authHeaderValue = 'Bearer ' + jwtAuthParam;
        } else if (request.headers[this.authHeaderName]) {
            try {
                authHeaderValue = request.headers[this.authHeaderName];
            } catch (error) {
                console.log('Something went wrong when getting the JWT bearer from the header', request.headers)
            }
        }

        // If we have sessionCredentials AND auth headers we need to check if they are the same.
        if (authHeaderValue !== null && sessionCredentials !== null && sessionCredentials.authHeaderValue === authHeaderValue) {
            // The auth header credentials are the same as those in the session,
            // no need to return new credentials so we're just nulling the token here
            return null
        }

        if (authHeaderValue !== null) {
            return {
                authHeaderValue: authHeaderValue
            }
        }

        return authHeaderValue;
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

    onUnAuthenticated(request, reply, error) {
        if (error instanceof MissingTenantError) {
            return reply.redirect(this.basePath + '/customerror?type=missingTenant');
        } else if (error instanceof SessionExpiredError) {
            return reply.redirect(this.basePath + '/customerror?type=sessionExpired');
        } else {
            return reply.redirect(this.basePath + '/customerror?type=authError');
        }
    }

    setupRoutes() {
        require('./routes')(this.pluginRoot, this.server, this.kbnServer, this.APP_ROOT, this.API_ROOT);
    }

}