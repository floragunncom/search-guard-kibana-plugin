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
            // @todo Ask Jochen about lowercase header names
            this.authHeaderName = this.config.get('searchguard.jwt.header').toLowerCase();
        } catch(error) {
            this.kbnServer.status.yellow('No authorization header name defined for JWT, using "authorization"');
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

    detectAuthHeaderCredentials(request, sessionCredentials = null) {
        const urlparamname = this.config.get('searchguard.jwt.url_param');
        const headername = this.config.get('searchguard.jwt.header');

        // @todo Remove the jwt-cookie - check backwards compability first
        //var jwtBearer = request.state.searchguard_jwt;
        var jwtBearer = null;
        let jwtAuthParam = request.query[urlparamname];

        // The token may be passed via a query parameter
        if (jwtAuthParam != null) {
            jwtBearer = jwtAuthParam;

        } else if (request.headers[headername.toLowerCase()]) {
            try {
                jwtBearer = request.headers[headername.toLowerCase()].split(' ')[1];
            } catch (error) {
                console.log('Something went wrong when getting the JWT bearer from the header', request.headers)
            }
        }

        // If we have sessionCredentials AND auth headers we need to check if they are the same.
        if (jwtBearer !== null && sessionCredentials !== null && sessionCredentials.token === jwtBearer) {
            // The auth header credentials are the same as those in the session,
            // no need to return new credentials so we're just nulling the token here
            jwtBearer = null;
        }

        if (jwtBearer !== null) {
            return {
                token: jwtBearer
            }
        }

        return jwtBearer;
    }

    async authenticate(credentials) {
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
            throw error;
        }
    }

    onUnAuthenticated(request, reply, error) {
        //console.log('GETTING ERROR')
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