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

import SearchGuardPlugin from './searchguard_plugin';
import AuthenticationError from '../auth/authentication_error';
import User from '../auth/user';

/**
 * The SearchGuard  backend.
 */
export default class SearchGuardBackend {

    constructor(server) {
        const config = Object.assign({ plugins: [SearchGuardPlugin], auth: false }, server.config().get('elasticsearch'));
        this._cluster = server.plugins.elasticsearch.createCluster('security',
            config
        );
        this._client = this._cluster._client;
    }

    async authenticate(credentials) {
        const authHeader = new Buffer(`${credentials.username}:${credentials.password}`).toString('base64');
        try {
            const response = await this._client.searchguard.authinfo({
                headers: {
                    authorization: `Basic ${authHeader}`
                }
            });
            return new User(credentials.username, credentials, credentials, response.sg_roles, response.sg_tenants);
        } catch(error) {
            if (error.status == 401) {
                throw new AuthenticationError();
            } else {
                throw error;
            }
        }
    }

    async authinfo(authHeader) {
        try {
            const response = await this._client.searchguard.authinfo({
                headers: {
                    authorization: authHeader
                }
            });
            return response
        } catch(error) {
            if (error.status == 401) {
                throw new AuthenticationError();
            } else {
                throw error;
            }
        }
    }

    async getAuthHeaders(user) {
        const credentials = user.proxyCredentials;
        const authHeader = new Buffer(`${credentials.username}:${credentials.password}`).toString('base64');
        return {
            'authorization': `Basic ${authHeader}`
        };
    }

}
