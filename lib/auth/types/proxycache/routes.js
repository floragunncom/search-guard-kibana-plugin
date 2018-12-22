import {parseLoginEndpoint} from "./parse_login_endpoint";

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

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

    const customErrorApp = server.getHiddenUiAppById('searchguard-customerror');

    /**
     * After a logout we are redirected to a login page
     */
    server.route({
        method: 'GET',
        path:  `${APP_ROOT}/login`,
        handler(request, reply) {
            // The customer may use a login endpoint, to which we can redirect
            // if the user isn't authenticated.
            let loginEndpoint = server.config().get('searchguard.proxycache.login_endpoint');
            if (loginEndpoint) {
                try {
                    const redirectUrl = parseLoginEndpoint(loginEndpoint);
                    return reply.redirect(redirectUrl);
                } catch(error) {
                    this.server.log(['error', 'searchguard'], 'An error occured while parsing the searchguard.proxycache.login_endpoint value');
                }
            } else {
                return reply.renderAppWithDefaultConfig(customErrorApp);
            }
        },
        config: {
            auth: false
        }
    });

    /**
     * The error page.
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
