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

import Boom from 'boom';
import Joi from 'joi';
import { isEmpty } from 'lodash';
import MissingTenantError from "../../errors/missing_tenant_error";

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

    const AuthenticationError = pluginRoot('lib/auth/errors/authentication_error');
    const loginApp = kbnServer.apps.byId['searchguard-login'];

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

                    const authHeaderValue = new Buffer(`${request.payload.username}:${request.payload.password}`).toString('base64');
                    let {user} = await request.auth.sgSessionStorage.authenticate({
                        authHeaderValue: 'Basic ' + authHeaderValue
                    });


                    // handle tenants if MT is enabled
                    if(server.config().get("searchguard.multitenancy.enabled")) {

                        // get the preferred tenant of the user
                        let globalTenantEnabled = server.config().get("searchguard.multitenancy.tenants.enable_global");
                        let privateTenantEnabled = server.config().get("searchguard.multitenancy.tenants.enable_private");
                        let preferredTenants = server.config().get("searchguard.multitenancy.tenants.preferred");

                        let finalTenant = server.plugins.searchguard.getSearchGuardBackend().getTenantByPreference(request, user.username, user.tenants, preferredTenants, globalTenantEnabled, privateTenantEnabled);

                        request.auth.sgSessionStorage.putStorage('tenant', {
                            selected: finalTenant
                        });

                        return reply({
                            username: user.username,
                            tenants: user.tenants,
                            roles: user.roles,
                            backendroles: user.backendroles,
                            selectedTenant: user.selectedTenant,
                        });
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
                    } else if (error instanceof MissingTenantError) {
                        return reply(Boom.notFound('Missing Tenant'));
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
            request.auth.sgSessionStorage.clear();
            reply({});
        },
        config: {
            auth: false
        }
    });

}; //end module
