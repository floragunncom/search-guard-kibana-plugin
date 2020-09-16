/**
 *    Copyright 2020 floragunn GmbH

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

const responseInterceptors = [];

/**
 * Add a response interceptor for each fetch request
 *
 * The interceptor should return a promise,
 * which in turn should resolve the the response.
 *
 * async function(response, url, config) {
 *   // Perform checks and/or mutations
 *   return response;
 * }
 *
 * @param interceptor
 */
export function addResponseInterceptor(interceptor) {
  responseInterceptors.push(interceptor);
}

/**
 * Go through all registered response interceptors
 * @param response
 * @param url
 * @param config
 * @returns {Promise<void>}
 */
async function runResponseInterceptors(response, url, config) {
  for (let i = 0; i < responseInterceptors.length; i++) {
    try {
      // Run interceptors sequentially, which allows each
      // interceptor to mutate the response, if needed.
      response = await responseInterceptors[i](response, url, config);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return response;
}

if (window.fetch) {
  wrapFetch();
}

/**
 * Wraps native window.fetch. This makes it possible for
 * us to intercept any fetch requests. Kibana's fetch
 * interceptors only have access to the response body
 */
function wrapFetch() {
  const nativeFetch = window.fetch;
  window.fetch = (url, config) => {
    return nativeFetch(url, config)
      .then(async(response) => {
        try {
          response = await runResponseInterceptors(response, url, config)
        } catch (error) {
          throw error;
        }

        return response;
      });
  };
}

