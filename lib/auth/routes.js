/**
 *    Copyright 2016 floragunn GmbH

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

import Boom from 'boom';
import Joi from 'joi';
import { isEmpty } from 'lodash';

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

    const AuthenticationError = pluginRoot('lib/auth/authentication_error');
    const config = server.config();
    const sessionTTL = config.get('searchguard.session.ttl');
    const loginApp = server.getHiddenUiAppById('searchguard-login');

    /**
     * The login page.
     */
    server.route({
        method: 'GET',
        path:  `${APP_ROOT}/login`,
        handler(request, reply) {
            return reply.renderAppWithDefaultConfig(loginApp);
        },
        config: {
            auth: false
        }
    });



    server.route({
        method: 'POST',
        path: `${API_ROOT}/auth/login`,
        handler: {
            async: async (request, reply) => {
                try {
                    // In order to prevent direct access for certain usernames (e.g. service users like
                    // kibanaserver, logstash etc.) we can add them to basicauth.forbidden_usernames.
                    // If the username in the payload matches an item in the forbidden array, we throw an AuthenticationError
                    const basicAuthConfig = server.config().get('searchguard.basicauth');
                    if (basicAuthConfig.forbidden_usernames && basicAuthConfig.forbidden_usernames.length) {
                        if (request.payload && request.payload.username && basicAuthConfig.forbidden_usernames.indexOf(request.payload.username) > -1) {
                            throw new AuthenticationError('Invalid username or password');
                        }
                    }

                    let user = await server.plugins.searchguard.getSearchGuardBackend().authenticate(request.payload);
                    let session = {
                        username: user.username,
                        credentials: user.credentials,
                        proxyCredentials: user.proxyCredentials
                    };
                    if (sessionTTL) {
                        session.expiryTime = Date.now() + sessionTTL;
                    }
                    request.auth.session.set(session);

                    // handle tenants if MT is enabled
                    if(server.config().get("searchguard.multitenancy.enabled")) {

                        // get the preferred tenant of the user
                        let globalTenantEnabled = server.config().get("searchguard.multitenancy.tenants.enable_global");
                        let privateTenantEnabled = server.config().get("searchguard.multitenancy.tenants.enable_private");
                        let preferredTenants = server.config().get("searchguard.multitenancy.tenants.preferred");

                        let finalTenant = server.plugins.searchguard.getSearchGuardBackend().getTenantByPreference(request, user.username, user.tenants, preferredTenants, globalTenantEnabled, privateTenantEnabled);

                        return reply({
                            username: user.username,
                            tenants: user.tenants,
                            roles: user.roles,
                            backendroles: user.backendroles,
                            selectedTenant: user.selectedTenant,
                        }).state('searchguard_tenant', finalTenant);
                    } else {
                        // no MT, nothing more to do
                        return reply({
                            username: user.username,
                            tenants: user.tenants
                        });
                    }
                } catch (error) {
                    if (error instanceof AuthenticationError) {
                        return reply(Boom.unauthorized(error.message));
                    } else {
                        return reply(Boom.badImplementation(error.message));
                    }
                }
            }
        },
        config: {
            validate: {
                payload: {
                    username: Joi.string().required(),
                    password: Joi.string().required()
                }
            },
            auth: false
        }
    });

    server.route({
        method: 'POST',
        path: `${API_ROOT}/auth/logout`,
        handler: (request, reply) => {
            request.auth.session.clear();
            reply({}).unstate('searchguard_tenant');
        },
        config: {
            auth: false
        }
    });

}; //end module
