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
import elasticsearch from 'elasticsearch';
import { readFileSync } from 'fs';
import SearchGuardConfigurationPlugin from './searchguard_configuration_plugin';
import wrapElasticsearchError from './../../backend/errors/wrap_elasticsearch_error';
import NotFoundError from './../../backend/errors/not_found';
import Resources from '../resources';
import User from '../../auth/user';
import { parseConfig } from './parse_config';

/**
 * The SearchGuard  backend.
 */
export default class SearchGuardConfigurationBackend {

    constructor(server) {

        this._esconfig = server.config().get('elasticsearch');

    }

    /**
     * Returns a list of object identifiers for the specified resource name.
     *
     * @param {String} resourceName - A resource name.
     * @return {Array} - An array of object identifiers.
     * @throws {Error} - An Elasticsearch client error.
     */
    async list(resourceName, certificates) {

        var client = this.createClient(certificates);
        try {
            const response = await client.searchguard.listResource({
                resourceName: this._getSGConfigurationName(resourceName)
            });
            return response;
        } catch (error) {
            throw wrapElasticsearchError(error);
        } finally {
            client.close();
        }
    }

    /**
     * Returns an instance of the specified resource.
     *
     * @param {String} resourceName - A resource identifier.
     * @param {String} id - An object identifier.
     * @throws {Error} - An Elasticsearch client error.
     */
    async get(resourceName, id, certificates) {

        var client = this.createClient(certificates);

        try {
            const response = await client.searchguard.getResource({
                resourceName: this._getSGResourceName(resourceName),
                id
            });
            return response[id];
        } catch (error) {
            if (error.status === 404) {
                throw new NotFoundError();
            }
            throw wrapElasticsearchError(error);
        } finally {
            client.close();
        }
    }

    async save(resourceName, id, body, certificates) {
        var client = this.createClient(certificates);
        try {
            const response = await client.searchguard.saveResource({
                resourceName: this._getSGResourceName(resourceName),
                id,
                body: body
            });
            return response;
        } catch (error) {
            if (error.status === 404) {
                throw new NotFoundError();
            }
            throw wrapElasticsearchError(error);
        } finally {
            client.close();
        }
    }

    /**
     * Deletes an instance of the specified resource.
     *
     * @param {String} resourceName - A resource identifier.
     * @param {String} id - An object identifier.
     * @throws {Error} - An Elasticsearch client error.
     */
    async delete(resourceName, id, certificates) {
        var client = this.createClient(certificates);
        try {
            return await client.searchguard.deleteResource({
                resourceName: this._getSGResourceName(resourceName),
                id
            });
        } catch (error) {
            if (error.status === 404) {
                throw new NotFoundError();
            }
            throw wrapElasticsearchError(error);
        } finally {
            client.close();
        }
    }

    async clearCache(certificates) {
        var client = this.createClient(certificates);
        try {
            const response = await client.searchguard.clearCache();
            return response;
        } catch (error) {
            throw wrapElasticsearchError(error);
        } finally {
            client.close();
        }
    }

    /**
     * @return {String} a Search Guard configuration name from @resourceName.
     * @private
     */
    _getSGConfigurationName(resourceName) {
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

    createClient(certificatesString) {

        var configSSL = Object.assign({ plugins: [SearchGuardConfigurationPlugin], auth: true }, this._esconfig);
        var config = parseConfig(configSSL);

        if (certificatesString) {
            var certificates = JSON.parse(certificatesString);
            if(certificates) {
                config.ssl.cert = certificates.certificate;
                config.ssl.key = certificates.key;
                config.ssl.passphrase = certificates.passphrase
            }
        }

        var client = elasticsearch.Client(config);

        return client;
    }


}
