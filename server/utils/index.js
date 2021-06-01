/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { get } from 'lodash';

export { fetchAllFromScroll } from './fetch_all_from_scroll';
export { wrapForCustomError } from './wrap_elasticsearch_error';

export function isAuthorized(result, authHeaderName = 'authorization') {
  const credentials = get(result, `meta.request.params.headers${authHeaderName}`, '');
  return !!credentials.length;
}
