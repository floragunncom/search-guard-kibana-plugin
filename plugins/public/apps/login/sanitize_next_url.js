/**
 *    Copyright 2019 floragunn GmbH

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

import { parse } from "url";

export function sanitizeNextUrlFromFullUrl(fullUrl, basePath = '') {
  const nextUrlOnFail = (basePath[basePath.length - 1] !== '/') ? basePath + '/' : basePath;

  // Parse the full url
  const parsedCurrentUrl = parse(fullUrl, true, true);

  // If we don't have any nextUrl in the query parameters, there's nothing to do
  if (!parsedCurrentUrl.query.nextUrl) {
    return nextUrlOnFail;
  }

  // Now parse the nexUrl query parameter to avoid
  // that any arbitrary URL can be injected.
  const parsedNextUrl = parse(parsedCurrentUrl.query.nextUrl, false, true);
  const maliciousProperties = ['hostname', 'protocol', 'port']
    .filter(property => (parsedNextUrl[property] !== null));

  if (!parsedNextUrl.pathname || maliciousProperties.length || parsedNextUrl.pathname.indexOf(basePath) !== 0) {
    return nextUrlOnFail;
  } else {
    return parsedCurrentUrl.query.nextUrl + (parsedCurrentUrl.hash || '');
  }

}
