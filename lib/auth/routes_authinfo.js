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

module.exports = function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT) {

  server.route({
    method: 'GET',
    path: `${API_ROOT}/auth/authinfo`,
    handler: async request => {
      try {
        const authinfo = await server.plugins.searchguard.getSearchGuardBackend().authinfo(request.headers);

        // Avoid Internal IP Disclosure Pattern
        // https://floragunn.atlassian.net/browse/ITT-2387
        delete authinfo.remote_address;

        return authinfo;
      } catch(error) {
        if (error.isBoom) {
          return error;
        }
        throw error;
      }
    }
  });

}; //end module
