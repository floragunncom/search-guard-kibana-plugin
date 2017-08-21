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
import SearchGuardConfigurationPlugin from './searchguard_configuration_plugin';
import wrapElasticsearchError from './../../backend/errors/wrap_elasticsearch_error';
import NotFoundError from './../../backend/errors/not_found';
import Resources from '../resources';
import User from '../../auth/user';

/**
 * The SearchGuard  backend.
 */
export default class SearchGuardConfigurationBackend {

    constructor(server) {

        // client for configuration / REST API
        var configSSL = Object.assign({ plugins: [SearchGuardConfigurationPlugin], auth: true }, server.config().get('elasticsearch'));

        configSSL.ssl["certificate"] = server.config().get('searchguard.configuration.ssl.cert');
        configSSL.ssl["key"] = server.config().get('searchguard.configuration.ssl.key');

        this._managementcluster = server.plugins.elasticsearch.createCluster('management',
            configSSL
        );

        this._managementClient = this._managementcluster._client;

        // the es config for later use
        this._esconfig = server.config().get('elasticsearch');

        console.log(this._managementcluster);
    }

    initializeAdminCertificate(certificate, key, passphrase) {
        if (this._managementClient) {
            this._managementClient.close();
        }
        // client for configuration / REST API
        var configSSL = Object.assign({ plugins: [SearchGuardConfigurationPlugin], auth: true }, this._esconfig);

        configSSL.ssl["certificate"] = certificate;
        configSSL.ssl["key"] = key;
        // passphrase

        this._managementcluster = server.plugins.elasticsearch.createCluster('management',
            configSSL
        );

        this._managementClient = this._managementcluster._client;

    }

    /**
     * Returns a list of object identifiers for the specified resource name.
     *
     * @param {String} resourceName - A resource name.
     * @return {Array} - An array of object identifiers.
     * @throws {Error} - An Elasticsearch client error.
     */
    async list(resourceName) {
        try {
            const response = await this._managementClient.searchguard.listResource({
                resourceName: this._getSGConfigurationName(resourceName)
            });
            return response;
        } catch (error) {
            throw wrapElasticsearchError(error);
        }
    }

    /**
     * Returns an instance of the specified resource.
     *
     * @param {String} resourceName - A resource identifier.
     * @param {String} id - An object identifier.
     * @throws {Error} - An Elasticsearch client error.
     */
    async get(resourceName, id) {
        try {
            const response = await this._managementClient.searchguard.getResource({
                resourceName: this._getSGResourceName(resourceName),
                id
            });
            return response[id];
        } catch (error) {
            if (error.status === 404) {
                throw new NotFoundError();
            }
            throw wrapElasticsearchError(error);
        }
    }

    async save(resourceName, id, parameters) {
        try {
            const response = await this._managementClient.searchguard.saveResource({
                resourceName: this._getSGResourceName(resourceName),
                id,
                body: parameters
            });
            return response;
        } catch (error) {
            if (error.status === 404) {
                throw new NotFoundError();
            }
            throw wrapElasticsearchError(error);
        }
    }

    /**
     * Deletes an instance of the specified resource.
     *
     * @param {String} resourceName - A resource identifier.
     * @param {String} id - An object identifier.
     * @throws {Error} - An Elasticsearch client error.
     */
    async delete(resourceName, id) {
        try {
            return await this._managementClient.searchguard.deleteResource({
                resourceName: this._getSGResourceName(resourceName),
                id
            });
        } catch (error) {
            if (error.status === 404) {
                throw new NotFoundError();
            }
            throw wrapElasticsearchError(error);
        }
    }

    async clearCache() {
        try {
            const response = await this._managementClient.searchguard.clearCache();
            return response;
        } catch (error) {
            throw wrapElasticsearchError(error);
        }
    }

    /**
     * @return {String} a Search Guard configuration name from @resourceName.
     * @private
     */
    _getSGConfigurationName(resourceName) {
        console.log(resourceName);
        switch (resourceName) {
            case 'config':
                return Resources.CONFIG;
            case Resources.INTERNAL_USER:
                return 'internalusers';
            case Resources.ACTIONGROUP:
                return 'actiongroups';
            case Resources.ROLEMAPPING:
                return 'rolesmapping';
            case Resources.ROLE:
                return 'roles';
            default:
                throw new Error('Unknown resource');
        }
    }

    /**
     * @return {String} a Search Guard resource name from @resourceName.
     * @private
     */
    // TODO: get rid of resources mapping, or do it once
    _getSGResourceName(resourceName) {
        switch (resourceName) {
            case 'config':
                return Resources.CONFIG;
            case Resources.INTERNAL_USER:
                return 'user';
            case Resources.ACTIONGROUP:
                return 'actiongroup';
            case Resources.ROLEMAPPING:
                return 'rolesmapping';
            case Resources.ROLE:
                return 'roles';
            default:
                throw new Error('Unknown resource');
        }
    }


}
