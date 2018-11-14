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
import MissingRoleError from "../../errors/missing_role_error";

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

    const AuthenticationError = pluginRoot('lib/auth/errors/authentication_error');
    const loginApp = server.getHiddenUiAppById('searchguard-login');
    const config = server.config();

    /**
     * The login page.
     */
    server.route({
        method: 'GET',
        path:  `${APP_ROOT}/login`,
        handler: {
            async: async(request, reply) => {
                try {
                    const basePath = config.get('server.basePath');

                    // Check if we have alternative login headers
                    const alternativeHeaders = config.get('searchguard.basicauth.alternative_login.headers');
                    if (alternativeHeaders && alternativeHeaders.length) {
                        let requestHeaders = Object.keys(request.headers).map(header => header.toLowerCase());
                        let foundHeaders = alternativeHeaders.filter(header => requestHeaders.indexOf(header.toLowerCase()) > -1);
                        if (foundHeaders.length) {
                            let {session} = await request.auth.sgSessionStorage.authenticateWithHeaders(request.headers);

                            let nextUrl = null;
                            if (request.url && request.url.query && request.url.query.nextUrl) {
                                nextUrl = parseNextUrl(request.url.query.nextUrl, basePath);
                            }

                            if (nextUrl) {
                                nextUrl = parseNextUrl(nextUrl, basePath);
                                return reply.redirect(nextUrl);
                            }

                            return reply.redirect(basePath + '/app/kibana');
                        }
                    }
                } catch (error) {
                    if (error instanceof MissingRoleError) {
                        return reply.redirect(basePath + '/customerror?type=missingRole');
                    } else if (error instanceof MissingTenantError) {
                        return reply.redirect(basePath + '/customerror?type=missingTenant');
                    }
                    // Let normal authentication errors through(?) and just go to the regular login page?
                }

                return reply.renderAppWithDefaultConfig(loginApp);
            }
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
                        return reply(Boom.notFound(error.message));
                    } else if (error instanceof MissingRoleError) {
                        return reply(Boom.notFound(error.message));
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
