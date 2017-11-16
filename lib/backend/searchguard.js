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

import _ from 'lodash';
import filterAuthHeaders from '../auth/filter_auth_headers';
import SearchGuardPlugin from './searchguard_plugin';
import AuthenticationError from '../auth/authentication_error';
import wrapElasticsearchError from './errors/wrap_elasticsearch_error';
import User from '../auth/user';

/**
 * The SearchGuard  backend.
 */
export default class SearchGuardBackend {

    constructor(server) {
        // client for authentication and authorization
        const config = Object.assign({ plugins: [SearchGuardPlugin], auth: true }, server.config().get('elasticsearch'));
        this._cluster = server.plugins.elasticsearch.createCluster('searchguard', config
        );

        this._client = this._cluster._client;

        // the es config for later use
        this._esconfig = server.config().get('elasticsearch');
    }

    async authenticate(credentials) {
        const authHeader = new Buffer(`${credentials.username}:${credentials.password}`).toString('base64');
        try {
            const response = await this._client.searchguard.authinfo({
                headers: {
                    authorization: `Basic ${authHeader}`
                }
            });
            return new User(credentials.username, credentials, credentials, response.sg_roles, response.backend_roles, response.sg_tenants, response.user_requested_tenant);
        } catch(error) {
            if (error.status == 401) {
                throw new AuthenticationError("Invalid username or password");
            } else {
                throw new Error(error.message);
            }
        }
    }

    async authinfo(headers) {
        try {
            const authHeaders = filterAuthHeaders(headers, this._esconfig.requestHeadersWhitelist);
            const response = await this._client.searchguard.authinfo({
                headers: authHeaders
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

    async multitenancyinfo(headers) {
        try {
            const authHeaders = filterAuthHeaders(headers, this._esconfig.requestHeadersWhitelist);
            const response = await this._client.searchguard.multitenancyinfo({
                headers: authHeaders
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

    async systeminfo(headers) {
        try {
            const authHeaders = filterAuthHeaders(headers, this._esconfig.requestHeadersWhitelist);
            const response = await this._client.searchguard.systeminfo({
                headers: authHeaders
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


    async uploadLicense(headers, body) {
        const authHeaders = filterAuthHeaders(headers, this._esconfig.requestHeadersWhitelist);
        try {
            const response = await this._client.searchguard.uploadLicense({
                body: body,
                headers: authHeaders
            });
            return response;
        } catch (error) {
            throw wrapElasticsearchError(error);
        } finally {

        }
    }

    async getAuthHeaders(user) {
        const credentials = user.credentials;
        const authHeader = new Buffer(`${credentials.username}:${credentials.password}`).toString('base64');
        return {
            'authorization': `Basic ${authHeader}`
        };
    }

    getUser(username, password) {
        var credentials = {"username": username, "password": password};
        var user = new User(credentials.username, credentials, credentials, [], {});
        return user;
    }

    getServerUser() {
        return this.getUser(this._esconfig.username, this._esconfig.password);
    }

    updateAndGetTenantPreferences(request, user, tenant) {

        var prefs = request.state.searchguard_preferences;
        // no prefs cookie present
        if (!prefs) {
            var newPrefs = {};
            newPrefs[user] = tenant;
            return newPrefs;
        }
        prefs[user] = tenant;
        return prefs;
    }

    getTenantByPreference(request, username, tenants, preferredTenants, globalEnabled, privateEnabled) {
        // delete user from tenants first to check if we have a tenant to choose from at all
        // keep original preferences untouched, we need the original values again
        // http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
        var tenantsCopy = JSON.parse(JSON.stringify(tenants));
        delete tenantsCopy[username];

        // sanity check
        if (!globalEnabled && !privateEnabled && _.isEmpty(tenantsCopy)) {
            return null;
        }
        // get users preferred tenant
        var prefs = request.state.searchguard_preferences;

        if (prefs) {
            var preferredTenant = prefs[username];

            // user has a preferred tenant, check if it is accessible
            if (preferredTenant && tenants[preferredTenant] != undefined) {
                return preferredTenant;
            }

            // special case: in tenants returned from SG, the private tenant is
            // the username of the logged in user, but the header value is __user__
            if (preferredTenant == "__user__" && tenants[username] != undefined && privateEnabled) {
                return "__user__";
            }
        }

        // no preference in cookie, or tenant no accessible anymore, evaluate preferredTenants from kibana config
        if (preferredTenants && !_.isEmpty(preferredTenants)) {
            for (var i = 0; i < preferredTenants.length; i++) {
                var check = preferredTenants[i];
                if (tenants[check] != undefined) {
                    return check;
                }
            }
        }

        // no pref in cookie, no preferred tenant in kibana, use GLOBAL, Private or the first tenant in the list
        if (globalEnabled) {
            return "";
        }

        if (privateEnabled) {
            return "__user__";
        } else {
            delete tenants[username];
        }

        // sort tenants by putting the keys in an array first
        var tenantkeys = [];
        var k;

        for (k in tenants) {
            tenantkeys.push(k);
        }
        tenantkeys.sort();
        return tenantkeys[0];
    }

    validateTenant(username, requestedTenant, tenants, globalEnabled, privateEnabled) {
        // delete user from tenants first to check if we have a tenant to choose from at all
        // keep original preferences untouched, we need the original values again
        // http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
        var tenantsCopy = JSON.parse(JSON.stringify(tenants));
        delete tenantsCopy[username];

        // sanity check: no global, no private, no other tenants -> no tenant available
        if (!globalEnabled && !privateEnabled && _.isEmpty(tenantsCopy)) {
            return null;
        }

        // requested tenant accessible for user
        if (tenants[requestedTenant] != undefined) {
            return requestedTenant;
        }

        if (requestedTenant == "private" && tenants[username] && privateEnabled) {
            return "__user__";
        }

        if (requestedTenant == "global" && globalEnabled) {
            return "";
        }

        return null;
    }



}
