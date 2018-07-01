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

import { parse } from 'url';

export function parseNextUrl(nextUrl, basePath) {

    // check forgery of protocol, hostname, port, pathname
    const { protocol, hostname, port, pathname, hash } = parse(nextUrl);
    if (protocol || hostname || port) {
        return `${basePath}/`;
    }
    
    // We always need the base path
    if (!String(pathname).startsWith(basePath)) {
        return `${basePath}/${nextUrl}`;
    }

    // All valid
    return nextUrl

}
