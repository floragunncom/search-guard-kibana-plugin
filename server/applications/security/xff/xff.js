/* eslint-disable @osd/eslint/require-license-header */
import { ensureRawRequest } from '../../../../../../src/core/server/http/router';

/**
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2019 floragunn GmbH

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

export default function (kibanaCore) {
  kibanaCore.http.registerOnPreAuth(async function (request, response, toolkit) {
    request = ensureRawRequest(request);
    request.headers['x-forwarded-for'] =
      (request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'] + ',' : '') +
      request.info.remoteAddress;
    request.headers['x-forwarded-port'] =
      request.headers['x-forwarded-port'] || request.info.remotePort;
    request.headers['x-forwarded-proto'] =
      request.headers['x-forwarded-proto'] || request.server.info.protocol;
    request.headers['x-forwarded-host'] = request.headers['x-forwarded-host'] || request.info.host;

    return toolkit.next();
  });
}
