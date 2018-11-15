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

import { assign } from 'lodash';
import Boom from 'boom';
import InvalidSessionError from "../errors/invalid_session_error";
import SessionExpiredError from "../errors/session_expired_error";

export default class AuthType {

    constructor(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {
        this.pluginRoot = pluginRoot;
        this.server = server;
        this.kbnServer = kbnServer;
        this.APP_ROOT = APP_ROOT;
        this.API_ROOT = API_ROOT;
        this.config = server.config();

        this.basePath = this.config.get('server.basePath');
        this.unauthenticatedRoutes = this.config.get('searchguard.auth.unauthenticated_routes');

        this.sessionTTL = this.config.get('searchguard.session.ttl');
        this.sessionKeepAlive = this.config.get('searchguard.session.keepalive');

        this.unauthenticatedRoutes.push("/api/v1/systeminfo");

        /**
         * The authType is saved in the auth cookie for later reference
         * @type {string}
         */
        this.type = null;

        /**
         * Tells the sessionPlugin whether or not to validate the number of tenants when authenticating
         * @type {boolean}
         */
        this.validateAvailableTenants = true;

        /**
         * The name of the header were we look for an authorization value.
         * This should most likely be set in the subclass depending on a config value.
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

    setupStorage() {
        this.server.register({
            register: this.pluginRoot('lib/session/sessionPlugin'),
            options: {
                authType: this.type,
                authHeaderName: this.authHeaderName,
                authenticateFunction: this.authenticate.bind(this),
                validateAvailableTenants: this.validateAvailableTenants
            }
        })
    }

    getCookieConfig() {
        const cookieConfig = {
            password: this.config.get('searchguard.cookie.password'),
            cookie: this.config.get('searchguard.cookie.name'),
            isSecure: this.config.get('searchguard.cookie.secure'),
            validateFunc: this.sessionValidator(this.server),
            clearInvalid: true,
            ttl: this.config.get('searchguard.cookie.ttl')
        };

        return cookieConfig;
    }

    /**
     * Returns the auth header needed for the Search Guard backend
     * @param session
     * @returns {*}
     */
    getAuthHeader(session) {
        if (session.credentials && session.credentials.authHeaderValue) {
            return {
                [this.authHeaderName]: session.credentials.authHeaderValue
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

        if (request.headers[this.authHeaderName]) {
            const authHeaderValue = request.headers[this.authHeaderName];

            // If we have sessionCredentials AND auth headers we need to check if they are the same.
            if (sessionCredentials !== null && sessionCredentials.authHeaderValue === authHeaderValue) {
                // The auth header credentials are the same as those in the session,
                // no need to return new credentials so we're just nulling the token here
                return null;
            }

            return {
                authHeaderValue: authHeaderValue
            }
        }

        return null;
    }

    authenticate(credentials) {
        throw new Error('The authenticate method must be implemented by the sub class');
    }

    onUnAuthenticated(request, reply) {
        throw new Error('The onUnAuthenticated method must be implemented by the sub class');
    }

    setupRoutes() {
        throw new Error('The getAuthHeader method must be implemented by the sub class');
    }

    setupAuthScheme() {
        this.server.auth.strategy('sg_access_control_cookie', 'cookie', false, this.getCookieConfig());
        this.server.auth.scheme('sg_access_control_scheme', (server, options) => ({
            authenticate: (request, reply) => {
                // let configured routes that are not under our control pass,
                // for example /api/status to check Kibana status without a logged in user
                if (this.unauthenticatedRoutes.includes(request.path)) {
                    var credentials = this.server.plugins.searchguard.getSearchGuardBackend().getServerUser();
                    reply.continue({credentials});
                    return;
                };

                this.server.auth.test('sg_access_control_cookie', request, async(error, credentials) => {
                    if (error) {
                        let authHeaderCredentials = this.detectAuthHeaderCredentials(request);
                        if (authHeaderCredentials) {
                            try {
                                let {session} = await request.auth.sgSessionStorage.authenticate(authHeaderCredentials);

                                // Returning the session equals setting the values with hapi-auth-cookie@set()
                                return reply.continue({
                                    // Watch out here - hapi-auth-cookie requires us to send back an object with credentials
                                    // as a key. Otherwise other values than the credentials will be overwritten
                                    credentials: session
                                });
                            } catch (authError) {
                                return this.onUnAuthenticated(request, reply, authError);
                            }
                        }

                        // This is a special case for when we have anonymous auth enabled AND are using basic auth
                        if (this.anonymousAuthEnabled === true && this.type === 'basicauth') {
                            try {
                                let {session} = await request.auth.sgSessionStorage.authenticate({});
                                session.isAnonymousAuth = true;

                                // Returning the session equals setting the values with hapi-auth-cookie@set()
                                return reply.continue({
                                    // Watch out here - hapi-auth-cookie requires us to send back an object with credentials
                                    // as a key. Otherwise other values than the credentials will be overwritten
                                    credentials: session
                                });
                            } catch (authError) {
                                return this.onUnAuthenticated(request, reply, authError);
                            }
                        }

                        if (request.headers) {
                            // If the session has expired, we may receive ajax requests that can't handle a 302 redirect.
                            // In this case, we trigger a 401 and let the interceptor handle the redirect on the client side.
                            if ((request.headers.accept && request.headers.accept.split(',').indexOf('application/json') > -1)
                                || (request.headers['content-type'] && request.headers['content-type'].indexOf('application/json') > -1)) {
                                return reply({message: 'Session expired', redirectTo: 'login'}).code(401);
                            }

                            // Cookie auth failed, user is not authenticated
                            return this.onUnAuthenticated(request, reply, error);
                        }
                    }
                    // credentials are everything that is in the auth cookie
                    reply.continue(credentials);
                });
            }
        }));

        // Activates hapi-auth-cookie for ALL routes, unless
        // a) the route is listed in "unauthenticatedRoutes" or
        // b) the auth option in the route definition is explicitly set to false
        this.server.auth.strategy('sg_access_control', 'sg_access_control_scheme', true);
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
                    let authResponse = await request.auth.sgSessionStorage.authenticate(differentAuthHeaderCredentials);
                    return callback(null, true, {credentials: authResponse.session});
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
                    // According to the documentation, returning the session in the cookie
                    // should be equivalent to calling request.auth.session.set(),
                    // but it seems like the cookie's browser lifetime isn't updated.
                    // Hence, we need to set it explicitly.
                    request.auth.session.set(session);
                }
            }

            // All good, return the session as it was
            return callback(null, true, {credentials: session});

        };

        return validate;
    }

    /**
     * Called on each authenticated request.
     * Used to add the credentials header to the request.
     *
     */
    assignAuthHeader() {
        this.server.ext('onPostAuth', (request, next) => {
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