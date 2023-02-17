/**
 *    Copyright 2017 floragunn GmbH

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

// TODO what is this used for?
export default function (pluginRoot, server, APP_ROOT, API_ROOT) {

    const config = server.config();
    const basePath = config.get('server.basePath');
    const backend = server.plugins.security.getEliatraSuiteBackend();
    const urlparamname = server.config().get('eliatra.security.auth.jwt.url_param');
    const headername = "Authorization";

    server.ext('onPostAuth', async function (request, next) {

        var jwtBearer = request.state.security_jwt;
        var jwtAuthParam = request.query[urlparamname];

        if(jwtAuthParam != null) {
            jwtBearer = jwtAuthParam;
            next.state('security_jwt', jwtBearer);
        }

        if (jwtBearer != null) {
            var headerValue = "Bearer " + jwtBearer;
            var headers = {};
            headers[headername] = headerValue;
            assign(request.headers, headers);
        }
        return next.continue();
    });
}
