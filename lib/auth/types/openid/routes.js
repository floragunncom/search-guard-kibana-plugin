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

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT, openIdEndPoints) {

    const AuthenticationError = pluginRoot('lib/auth/errors/authentication_error');
    const config = server.config();
    const basePath = config.get('server.basePath');
    const customErrorApp = server.getHiddenUiAppById('searchguard-customerror');

    const routesPath = '/auth/openid/';

    // Config
    const clientId = config.get('searchguard.openid.client_id');

    /**
     * The redirect uri can't always be resolved automatically.
     * Instead, we have the searchguard.openid.base_redirect_uri config option.
     * @returns {*}
     */
    function getBaseRedirectUrl() {
        const configuredBaseRedirectUrl = config.get('searchguard.openid.base_redirect_url');
        if (configuredBaseRedirectUrl) {
            // Strip trailing slash if available
            return (configuredBaseRedirectUrl.endsWith('/')) ? configuredBaseRedirectUrl.slice(0, -1) : configuredBaseRedirectUrl;
        }

        // Config option not used, try to get the correct protocol and host
        // @todo Test with server.name, server.host from the config (kibana.yml)
        // @todo This doesn't work - port is for some reason always 5603
        let host = config.get('server.host');
        let port = config.get('server.port');
        if (port) {
            host = host + ':' + port;
        }
        console.log('GOT THE HOST', host, config.get('server.port'))
        // @todo Jochen - any better way to get the protocol? Don't have the request available here
        return `${server.info.protocol}://${host}`;
    }

    // Register bell with the server
    server.register(require('bell'), function (err) {
        // @todo We don't have the request object here, how do we handle that? Config or server.info.?
        let baseRedirectUrl = getBaseRedirectUrl();
        let location = `${baseRedirectUrl}${basePath}`;
        server.auth.strategy('customOAuth', 'bell', {
            provider: {
                auth: openIdEndPoints.authorization_endpoint,
                token: openIdEndPoints.token_endpoint,
                scope: ['openid'],
                protocol: 'oauth2',
                useParamsAuth: true,
            },
            skipProfile: true,
            location: encodeURI(location),
            password: config.get('searchguard.cookie.password'),
            clientId: clientId,
            clientSecret: '',
            isSecure: config.get('searchguard.cookie.secure'),
        });

        /**
         * The login page.
         */
        server.route({
            method: ['GET', 'POST'],
            path: `${APP_ROOT}${routesPath}login`,
            config: {
                auth: 'customOAuth'
            },
            handler: {
                async: async (request, reply) => {
                    if (!request.auth.isAuthenticated) {
                        return reply('Authentication failed');
                    }

                    let credentials = request.auth.credentials;

                    let nextUrl = (credentials.query && credentials.query.nextUrl) ? credentials.query.nextUrl : null;

                    try {
                        // Bell gives us the access token to identify with here,
                        // but we want the id_token returned from the IDP
                        let {user} = await request.auth.sgSessionStorage.authenticate({
                            token: request.auth.artifacts['id_token']
                        });

                        if (nextUrl) {
                            nextUrl = parseNextUrl(nextUrl, basePath);
                            return reply.redirect(nextUrl);
                        }

                        return reply.redirect(basePath);
                    }
                    catch (error) {
                        if (error instanceof AuthenticationError) {
                            return reply.redirect(basePath + '/customerror?type=authError');
                        } else if (error instanceof MissingTenantError) {
                            return reply.redirect(basePath + '/customerror?type=missingTenant');
                        } else {
                            return reply(Boom.badImplementation(error.message));
                        }
                    }
                }
            }
        });
    });

    /**
     * The login page.
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
     * Additional GET logout that we need to redirect the user the the IdP
     */
    server.route({
        method: 'GET',
        path: `${APP_ROOT}${routesPath}logout`,
        handler: (request, reply) => {
            let baseRedirectUrl = getBaseRedirectUrl(request);
            let post_redirect_uri = `${baseRedirectUrl}${basePath}${routesPath}login`;

            // post_logout_redirect_uri is the standard for the redirect target after a logout
            return reply.redirect(openIdEndPoints.end_session_endpoint + '?post_logout_redirect_uri=' + post_redirect_uri);
        },
        config: {
            auth: false
        }
    });

    server.route({
        method: 'POST',
        path: `${API_ROOT}/auth/logout`,
        handler: (request, reply) => {
            request.auth.sgSessionStorage.clear();
            // @todo Move tenant to sgSession?
            reply({}).unstate('searchguard_tenant');
        },
        config: {
            auth: false
        }
    });

}; //end module
