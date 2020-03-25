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

import { customError as customErrorRoute } from '../common/routes';

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT, kibanaCore, kibanaConfig) {
    const router = kibanaCore.http.createRouter();
    const headers = {
        'content-security-policy': kibanaCore.http.csp.header,
    };

    /**
     * After a logout we are redirected to a login page
     */
    server.route({
        method: 'GET',
        path:  `${APP_ROOT}/login`,
        handler(request, h) {
            return h.redirect(`${APP_ROOT}/customerror`);
        },
        options: {
            auth: false
        }
    });

    /**
     * The error page.
     */
    customErrorRoute({ router, headers });

    server.route({
        method: 'POST',
        path: `${API_ROOT}/auth/logout`,
        handler: (request) => {
            request.auth.sgSessionStorage.clear();
            return {};
        },
        options: {
            auth: false
        }
    });

}; //end module
