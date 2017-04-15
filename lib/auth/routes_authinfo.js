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

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

    const AuthenticationError = pluginRoot('lib/auth/authentication_error');
    const config = server.config();
    const sessionTTL = config.get('searchguard.session.ttl');
    const loginApp = kbnServer.apps.byId['searchguard-login'];

    server.route({
        method: 'GET',
        path: `${API_ROOT}/v1/auth/authinfo`,
        handler: (request, reply) => {
            try {
                let authinfo =  server.plugins.searchguard.getSearchGuardBackend().authinfo(request.headers.authorization);
                return reply(authinfo);
            } catch(error) {
                return reply(Boom.badImplementation());
            }
        }
    });

}; //end module
