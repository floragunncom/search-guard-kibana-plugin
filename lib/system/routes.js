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

export default function (pluginRoot, server, APP_ROOT, API_ROOT) {

  server.route({
    method: 'GET',
    path: `${API_ROOT}/systeminfo`,
    handler: async (request, h) => {
      try {
        let systeminfo = server.plugins.searchguard.getSearchGuardBackend().systeminfo(request.headers);
        return systeminfo;
      } catch (error) {
        server.log(['error', 'load-systeminfo'], error);
      }
    }
  });

  server.route({
    method: 'POST',
    path: `${API_ROOT}/license`,
    handler: async request => {
      try {
        return await server.plugins.searchguard.getSearchGuardBackend().uploadLicense(request.headers, request.payload);
      } catch (error) {
        server.log(['error', 'upload-license'], error);
      }
    }
  });

} //end module
