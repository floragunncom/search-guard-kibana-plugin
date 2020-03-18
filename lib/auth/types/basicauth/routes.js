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
import AuthenticationError from '../../errors/authentication_error';
import MissingTenantError from "../../errors/missing_tenant_error";
import MissingRoleError from "../../errors/missing_role_error";
import {sanitizeNextUrl} from "../../sanitize_next_url";
import {ensureRawRequest} from "../../../../../../src/core/server/http/router/request";
import { customError as customErrorRoute } from '../common/routes';

// @todo BasePath for routes?

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT, kibanaCore, kibanaConfig) {

    //const AuthenticationError = pluginRoot('lib/auth/errors/authentication_error');
    // @todo Alternative! const loginApp = server.getHiddenUiAppById('searchguard-login');
    const config = kibanaConfig;
    const basePath = kibanaCore.http.basePath.serverBasePath;
    const router = kibanaCore.http.createRouter();

  const headers = {
    'content-security-policy': kibanaCore.http.csp.header,
  };

  customErrorRoute({ router, headers });

    /**
     * The login page.
     */
    router.get({
        path: `${APP_ROOT}/login`,
        validate: false,
        options: {
            authRequired: false
        },
      }, async(context, request, response) => {
            // @todo Fix indentation in a subsequent commit
            try {
                // Check if we have alternative login headers
                const alternativeHeaders = config.get('searchguard.basicauth.alternative_login.headers');
                if (alternativeHeaders && alternativeHeaders.length) {
                    let requestHeaders = Object.keys(request.headers).map(header => header.toLowerCase());
                    let foundHeaders = alternativeHeaders.filter(header => requestHeaders.indexOf(header.toLowerCase()) > -1);
                    if (foundHeaders.length) {
                        let {session} = await request.auth.sgSessionStorage.authenticateWithHeaders(request.headers);

                        let nextUrl = null;
                        if (request.url && request.url.query && request.url.query.nextUrl) {
                            nextUrl = sanitizeNextUrl(request.url.query.nextUrl, basePath);
                        }

                        if (nextUrl) {
                            nextUrl = sanitizeNextUrl(nextUrl, basePath);
                            return h.redirect(nextUrl);
                        }

                        return h.redirect(basePath + '/app/kibana');
                    }
                }
            } catch (error) {
                if (error instanceof MissingRoleError) {
                  return response.redirected({
                    headers: { location: `${basePath}/customerror?type=missingRole` },
                  });
                } else if (error instanceof MissingTenantError) {
                  return response.redirected({
                    headers: { location: `${basePath}/customerror?type=missingTenant` },
                  });
                }
                // Let normal authentication errors through(?) and just go to the regular login page?
            }


        return response.ok({
            body: await context.core.rendering.render({
                // Including user settings would cause a SO-call,
                // which in turn throws an Authentication Exception
                includeUserSettings: false
            }),
            headers,
        })
    });

    server.route({
        method: 'POST',
        path: `${API_ROOT}/auth/login`,
        async handler (request, h) {
            try {
                //console.log('What the config?', server.config())
                // In order to prevent direct access for certain usernames (e.g. service users like
                // kibanaserver, logstash etc.) we can add them to basicauth.forbidden_usernames.
                // If the username in the payload matches an item in the forbidden array, we throw an AuthenticationError

                const basicAuthConfig = config.get('searchguard.basicauth');
                if (basicAuthConfig.forbidden_usernames && basicAuthConfig.forbidden_usernames.length) {
                    if (request.payload && request.payload.username && basicAuthConfig.forbidden_usernames.indexOf(request.payload.username) > -1) {
                        throw new AuthenticationError('Invalid username or password');
                    }
                }

                if (basicAuthConfig.allowed_usernames && Array.isArray(basicAuthConfig.allowed_usernames)) {
                    try {
                        const username = request.payload.username;
                        if (basicAuthConfig.allowed_usernames.indexOf(username) === -1) {
                            throw new AuthenticationError('Invalid username or password');
                        }
                    } catch (error) {
                        throw new AuthenticationError('Invalid username or password');
                    }
                }



                const authHeaderValue = Buffer.from(`${request.payload.username}:${request.payload.password}`).toString('base64');
                let {user} = await request.auth.sgSessionStorage.authenticate({
                    authHeaderValue: 'Basic ' + authHeaderValue
                });



                // handle tenants if MT is enabled
                if(config.get("searchguard.multitenancy.enabled"), false) {

                    // get the preferred tenant of the user
                    let globalTenantEnabled = config.get("searchguard.multitenancy.tenants.enable_global");
                    let privateTenantEnabled = config.get("searchguard.multitenancy.tenants.enable_private");
                    let preferredTenants = config.get("searchguard.multitenancy.tenants.preferred");

                    let finalTenant = server.plugins.searchguard.getSearchGuardBackend().getTenantByPreference(request, user.username, user.tenants, preferredTenants, globalTenantEnabled, privateTenantEnabled);

                    request.auth.sgSessionStorage.putStorage('tenant', {
                        selected: finalTenant
                    });

                    return {
                        username: user.username,
                        tenants: user.tenants,
                        roles: user.roles,
                        backendroles: user.backendroles,
                        selectedTenant: user.selectedTenant,
                    };
                } else {
                    // no MT, nothing more to do
                    return {
                        username: user.username,
                        tenants: user.tenants
                    };
                }
            } catch (error) {
                if (error instanceof AuthenticationError) {
                    throw Boom.unauthorized(error.message);
                } else if (error instanceof MissingTenantError) {
                    throw Boom.notFound(error.message);
                } else if (error instanceof MissingRoleError) {
                    throw Boom.notFound(error.message);
                } else {
                    throw Boom.badImplementation(error.message);
                }
            }
        },

        options: {
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
        handler: (request, h) => {

            request.auth.sgSessionStorage.clear();
            return {};
        },
        options: {
            auth: false
        }
    });

    server.route({
        method: 'GET',
        path: `${APP_ROOT}/auth/anonymous`,
        async handler(request, h) {

            if (server.config().get('searchguard.auth.anonymous_auth_enabled')) {
                const basePath = server.config().get('server.basePath');
                try {
                    let {session} = await request.auth.sgSessionStorage.authenticate({}, {isAnonymousAuth: true});

                    let nextUrl = null;
                    if (request.url && request.url.query && request.url.query.nextUrl) {
                        nextUrl = sanitizeNextUrl(request.url.query.nextUrl, basePath);
                    }

                    if (nextUrl) {
                        nextUrl = sanitizeNextUrl(nextUrl, basePath);
                        return h.redirect(nextUrl);
                    }

                    return h.redirect(basePath + '/app/kibana');

                } catch (error) {

                    if (error instanceof MissingRoleError) {
                        return h.redirect(basePath + '/customerror?type=missingRole');
                    } else if (error instanceof MissingTenantError) {
                        return h.redirect(basePath + '/customerror?type=missingTenant');
                    } else {
                        return h.redirect(basePath + '/customerror?type=anonymousAuthError');
                    }
                }
            } else {
                return h.redirect(`${APP_ROOT}/login`);
            }
        },

        options: {
            auth: false
        }
    });
}; //end module
