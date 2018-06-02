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
const Wreck = require('wreck');

export default class OpenId extends AuthType {

    constructor(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

        super(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT);

        /**
         * The authType is saved in the auth cookie for later reference
         * @type {string}
         */
        this.type = 'openid';
        
        if (! this.config.get('searchguard.openid') || ! this.config.get('searchguard.openid.connect_url') || ! this.config.get('searchguard.openid.client_id')) {
            this.kbnServer.status.red('The necessary settings for the OpenId Connect IDP are missing, please refer to the documentation.');
        }

        try {
            this.authHeaderName = this.config.get('searchguard.openid.header').toLowerCase();
        } catch(error) {
            this.kbnServer.status.yellow('No authorization header name defined for OpenId, using "authorization"');
            this.authHeaderName = 'authorization'
        }
    }
    
    init() {
        this.setupStorage();
        this.setupAuthScheme();
        this.setupRoutes();
        this.assignAuthHeader();
    }
    
    getAuthHeader(session) {
        if (session.credentials && session.credentials.token) {
            return {
                [this.authHeaderName]: 'Bearer ' + session.credentials.token
            }
        }

        return false;
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

        let jwtBearer = null;
        const authHeaderName = this.config.get('searchguard.openid.header');

        if (request.headers[authHeaderName.toLowerCase()]) {
            try {
                // Remove the "Bearer" from the header value
                jwtBearer = request.headers[authHeaderName.toLowerCase()].split(' ')[1];
            } catch (error) {
                console.log('Something went wrong when getting the JWT bearer from the header', request.headers)
            }

            // If we have sessionCredentials AND auth headers we need to check if they are the same.
            if (sessionCredentials !== null && sessionCredentials.token === jwtBearer) {
                // The auth header credentials are the same as those in the session,
                // no need to return new credentials so we're just nulling the token here
                jwtBearer = null;
            }
        }

        if (jwtBearer !== null) {
            return {
                token: jwtBearer
            }
        }

        return null;
    }

    async authenticate(credentials)  {
        // A "login" can happen when we have a token (as header or as URL parameter but no session,
        // or when we have an existing session, but the passed token does not match what's in the session.
        try {

            let user = await this.server.plugins.searchguard.getSearchGuardBackend().authenticateWithHeader(this.authHeaderName, 'Bearer ' + credentials.token);
            let tokenPayload = JSON.parse(Buffer.from(credentials.token.split('.')[1], 'base64').toString());

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
            throw error
        }
    }

    onUnAuthenticated(request, reply, error) {
        // If we don't have any tenant we need to show the custom error page
        if (error instanceof MissingTenantError) {
            return reply.redirect(this.basePath + '/customerror?type=missingTenant')
        }

        const nextUrl = encodeURIComponent(request.url.path);
        return reply.redirect(`${this.basePath}/auth/openid/login?nextUrl=${nextUrl}`);
    }

    async setupRoutes() {

        if (! this.config.get('searchguard.openid.connect_url')) {
            throw new Error('searchguard.openid.connect_url for OpenId is missing in kibana.yml.')
        }

        Wreck.get(this.config.get('searchguard.openid.connect_url'), (err, response, payload) => {
            if (err ||
                response.statusCode < 200 ||
                response.statusCode > 299) {

                throw new Error('Failed when trying to obtain the endpoints from your IdP');
            }

            const parsedPayload = JSON.parse(payload.toString());

            let endPoints = {
                authorization_endpoint: parsedPayload.authorization_endpoint,
                token_endpoint: parsedPayload.token_endpoint,
                end_session_endpoint: parsedPayload.end_session_endpoint || null
            };

            require('./routes')(this.pluginRoot, this.server, this.kbnServer, this.APP_ROOT, this.API_ROOT, endPoints);
        });


    }
}