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

import util from 'util';
import Joi from 'joi';

export default function (Client, config, components) {

    const ca = components.clientAction.factory;

    Client.prototype.searchguard = components.clientAction.namespaceFactory();

    Client.prototype.searchguard.prototype.restapiinfo = ca({
        url: {
            fmt: '/_searchguard/api/permissionsinfo'
        }
    });

    Client.prototype.searchguard.prototype.indices = ca({
        url: {
            fmt: '/_all/_mapping/field/*'
        }
    });
    /**
     * Returns a Search Guard resource configuration.
     *
     * Sample response:
     *
     * {
    *   "user": {
    *       "hash": "#123123"
   *   }
   * }
     */
    Client.prototype.searchguard.prototype.listResource = ca({
        url: {
            fmt: '/_searchguard/api/<%=resourceName%>',
            req: {
                resourceName: {
                    type: 'string',
                    required: true
                }
            }
        }
    });

    /**
     * Creates a Search Guard resource instance.
     *
     * At the moment Search Guard does not support conflict detection,
     * so this method can be effectively used to both create and update resource.
     *
     * Sample response:
     *
     * {
   *   "status": "CREATED",
   *   "message": "User username created"
   * }
     */
    Client.prototype.searchguard.prototype.saveResource = ca({
        method: 'PUT',
        needBody: true,
        url: {
            fmt: '/_searchguard/api/<%=resourceName%>/<%=id%>',
            req: {
                resourceName: {
                    type: 'string',
                    required: true
                },
                id: {
                    type: 'string',
                    required: true
                }
            }
        }
    });

    /**
     * Returns a Search Guard resource instance.
     *
     * Sample response:
     *
     * {
   *   "user": {
   *     "hash": '#123123'
   *   }
   * }
     */
    Client.prototype.searchguard.prototype.getResource = ca({
        method: 'GET',
        url: {
            fmt: '/_searchguard/api/<%=resourceName%>/<%=id%>',
            req: {
                resourceName: {
                    type: 'string',
                    required: true
                },
                id: {
                    type: 'string',
                    required: true
                }
            }
        }
    });

    /**
     * Deletes a Search Guard resource instance.
     */
    Client.prototype.searchguard.prototype.deleteResource = ca({
        method: 'DELETE',
        url: {
            fmt: '/_searchguard/api/<%=resourceName%>/<%=id%>',
            req: {
                resourceName: {
                    type: 'string',
                    required: true
                },
                id: {
                    type: 'string',
                    required: true
                }
            }
        }
    });


    /**
     * Deletes a Search Guard resource instance.
     */
    Client.prototype.searchguard.prototype.clearCache = ca({
        method: 'DELETE',
        url: {
            fmt: '/_searchguard/api/cache',
        }
    });

    Client.prototype.searchguard.prototype.validateDls = ca({
        method: 'POST',
        needBody: true,
        url: {
            fmt: '/_validate/query?explain=true'
        }
    });

};

