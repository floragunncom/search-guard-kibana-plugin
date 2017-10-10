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

/**
 * SearchGuard plugin extension for the Elasticsearch Javascript client.
 */

import util from 'util';

export default function (Client, config, components) {

    const ca = components.clientAction.factory;

    Client.prototype.searchguard = components.clientAction.namespaceFactory();

    Client.prototype.searchguard.prototype.authinfo = ca({
        url: {
            fmt: '/_searchguard/authinfo'
        }
    });

    Client.prototype.searchguard.prototype.multitenancyinfo = ca({
        url: {
            fmt: '/_searchguard/kibanainfo'
        }
    });

    // use the license endpoint, not API
    Client.prototype.searchguard.prototype.systeminfo = ca({
        url: {
            fmt: '/_searchguard/license'
        }
    });

    Client.prototype.searchguard.prototype.uploadLicense = ca({
        method: 'PUT',
        needBody: true,
        url: {
            fmt: '/_searchguard/api/license'
        }
    });

};

