/*
 *    Copyright 2026 floragunn GmbH
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

import { PROXY_KEYWORD } from './constants';

// Returns the "proxy" value to store in the watch, or undefined if it should be omitted.
// An empty value or "default" means the cluster proxy setting, which the backend does not store either.
export const toStoredProxy = (proxy) => {
  const trimmedProxy = typeof proxy === 'string' ? proxy.trim() : '';
  if (!trimmedProxy || trimmedProxy.toLowerCase() === PROXY_KEYWORD.DEFAULT) return undefined;
  return trimmedProxy;
};

// Sets or removes the "proxy" attribute of an action or check according to toStoredProxy.
export const withStoredProxy = ({ proxy, ...rest }) => {
  const storedProxy = toStoredProxy(proxy);
  return storedProxy === undefined ? rest : { ...rest, proxy: storedProxy };
};
