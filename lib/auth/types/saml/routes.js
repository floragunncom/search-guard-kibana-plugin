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
import {parseNextUrl} from '../../parseNextUrl'
import MissingTenantError from "../../errors/missing_tenant_error";
import AuthenticationError from "../../errors/authentication_error";

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

    const AuthenticationError = pluginRoot('lib/auth/errors/authentication_error');
    const config = server.config();
    const basePath = config.get('server.basePath');
    const customErrorApp = server.getHiddenUiAppById('searchguard-customerror');

    const routesPath = '/auth/saml/';

    /**
     * The login page.
     */
    server.route({
        method: 'GET',
        path: `${APP_ROOT}${routesPath}login`,
        config: {
            auth: false
        },
        handler: {
            async: async (request, reply) => {
                if (request.auth.isAuthenticated) {
                    return reply.redirect(basePath + '/app/kibana');
                }

                let nextUrl = null;
                if (request.url && request.url.query && request.url.query.nextUrl) {
                    nextUrl = parseNextUrl(request.url.query.nextUrl, basePath);
                }

                try {
                    // Grab the request for SAML
                    server.plugins.searchguard.getSearchGuardBackend().getSamlHeader()
                        .then((samlHeader) => {
                            request.auth.sgSessionStorage.putStorage('temp-saml', {
                                requestId: samlHeader.requestId,
                                nextUrl: nextUrl
                            });

                            return reply.redirect(samlHeader.location);
                        })
                        .catch(() => {
                            return reply.redirect(basePath + '/customerror?type=samlConfigError');
                        });


                } catch (error) {
                    return reply.redirect(basePath + '/customerror?type=samlConfigError');
                }


            }
        }
    });

    /**
     * The page that the IdP redirects to after a successful login
     */
    server.route({
        method: 'POST',
        path: '/sg/saml/acs',
        config: {
            auth: false
        },
        handler: {
            async: async (request, reply) => {

                let storedRequestInfo = request.auth.sgSessionStorage.getStorage('temp-saml');
                request.auth.sgSessionStorage.clearStorage('temp-saml');

                try {
                    let credentials = await server.plugins.searchguard.getSearchGuardBackend().authtoken(storedRequestInfo.requestId, request.payload.SAMLResponse);

                    let {user} = await request.auth.sgSessionStorage.authenticate({
                        authHeaderValue: credentials.authorization
                    });

                    let nextUrl = storedRequestInfo.nextUrl;

                    if (nextUrl) {
                        nextUrl = parseNextUrl(nextUrl, basePath);
                        return reply.redirect(nextUrl);
                    }

                    return reply.redirect(basePath + '/app/kibana');

                } catch (error) {
                    if (error instanceof AuthenticationError) {
                        return reply.redirect(basePath + '/customerror?type=samlAuthError');
                    } else if (error instanceof MissingTenantError) {
                        return reply.redirect(basePath + '/customerror?type=missingTenant');
                    } else {
                        return reply.redirect(basePath + '/customerror?type=samlAuthError');
                    }
                }
            }
        }

    });

    /**
     * The custom error page.
     */
    server.route({
        method: 'GET',
        path:  `${APP_ROOT}/customerror`,
        handler(request, reply) {
            return reply.renderAppWithDefaultConfig(customErrorApp);
        },
        config: {
            auth: false
        }
    });


    /**
     * Logout
     */
    server.route({
        method: 'POST',
        path: `${API_ROOT}/auth/logout`,
        handler: (request, reply) => {
            request.auth.sgSessionStorage.clear();

            reply({redirectURL: `${APP_ROOT}${routesPath}login`});
        },
        config: {
            auth: false
        }
    });

}; //end module
