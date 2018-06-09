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
    }
    
    init() {
        this.setupStorage();
        this.setupAuthScheme();
        this.setupRoutes();
        this.assignAuthHeader();
    }



    detectAuthHeaderCredentials(request, sessionCredentials = null) {

        if (request.headers[this.authHeaderName]) {
            const authHeaderValue = request.headers[this.authHeaderName];

            if (sessionCredentials !== null && sessionCredentials.authHeaderValue === authHeaderValue) {
                // The auth header credentials are the same as those in the session,
                // no need to return new credentials so we can just return null
                return null;
            }

            console.log('Detected credentials?', request.headers)

            return {
                authHeaderValue: authHeaderValue
            }
        }

        return null;
    }

    async authenticate(credentials) {

        // A login can happen via a POST request (login form) or when we have request headers with user credentials.
        // We also need to re-authenticate if the credentials (headers) don't match what's in the session.
        try {
            let user = await this.server.plugins.searchguard.getSearchGuardBackend().authenticateWithHeader(this.authHeaderName, credentials.authHeaderValue);
            let session = {
                username: user.username,
                credentials: credentials,
                authType: this.type
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

    onUnAuthenticated(request, reply) {
        const nextUrl = encodeURIComponent(request.url.path);
        return reply.redirect(`${this.basePath}${this.APP_ROOT}/login?nextUrl=${nextUrl}`);
    }

    setupRoutes() {
        require('./routes')(this.pluginRoot, this.server, this.kbnServer, this.APP_ROOT, this.API_ROOT);
    }
}