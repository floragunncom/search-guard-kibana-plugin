/* eslint-disable @osd/eslint/require-license-header */
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

import { parse } from 'url';
import path from 'path';

/**
 *
 * @param nextUrl - Only the query parameter value instead of the complete url.
 * @param basePath
 * @returns {*}
 */
export function sanitizeNextUrl(nextUrl, basePath) {
  const parsedNextUrl = parse(nextUrl, false, true);
  const maliciousProperties = ['hostname', 'protocol', 'port'].filter(
    property => parsedNextUrl[property] !== null
  );
  if (maliciousProperties.length) {
    return basePath;
  }

  // We always need the base path
  if (nextUrl && basePath && !parsedNextUrl.pathname.startsWith(basePath)) {
    return path.posix.join(basePath, nextUrl);
  }

  // All valid
  return nextUrl;
}
