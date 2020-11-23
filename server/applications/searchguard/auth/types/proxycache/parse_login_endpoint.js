/* eslint-disable @kbn/eslint/require-license-header */
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

import { parse, format } from 'url';

/**
 *
 * @param loginEndpoint
 * @param request - Optional, only needed if we should append a "nextUrl" query parameter
 * @returns {*}
 */
export function parseLoginEndpoint(loginEndpoint, request = null) {
  // Parse the login endpoint so that we can append our nextUrl
  // if the customer has defined query parameters in the endpoint
  const loginEndpointURLObject = parse(loginEndpoint, true);

  // Make sure we don't overwrite an existing "nextUrl" parameter,
  // just in case the customer is using that name for something else
  if (typeof loginEndpointURLObject.query.nextUrl === 'undefined' && request) {
    const nextUrl = request.getBasePath() + request.url.path;
    // Delete the search parameter - otherwise format() will use its value instead of the .query property
    delete loginEndpointURLObject.search;
    loginEndpointURLObject.query.nextUrl = nextUrl;
  }
  // Format the parsed endpoint object into a URL and return
  return format(loginEndpointURLObject);
}
