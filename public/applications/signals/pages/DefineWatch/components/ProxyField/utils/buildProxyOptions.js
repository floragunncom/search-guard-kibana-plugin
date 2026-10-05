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

export const DEFAULT_PROXY_LABEL = 'Default (cluster proxy setting)';
export const NO_PROXY_LABEL = 'None';

const proxyLabel = ({ id, name }) => (name && name !== id ? `${name} (${id})` : id);

const toKeyword = (value) => {
  const lowerCaseValue = value.toLowerCase();
  return Object.values(PROXY_KEYWORD).includes(lowerCaseValue) ? lowerCaseValue : undefined;
};

// Builds the combo box options: the default/none keywords followed by the stored proxies, sorted by label.
export const buildProxyOptions = (proxies = []) => [
  { label: DEFAULT_PROXY_LABEL, value: PROXY_KEYWORD.DEFAULT },
  { label: NO_PROXY_LABEL, value: PROXY_KEYWORD.NONE },
  ...proxies
    .map((proxy) => ({ label: proxyLabel(proxy), value: proxy.id }))
    .sort((a, b) => a.label.localeCompare(b.label)),
];

// Maps the selected combo box option to the "proxy" value of the form. Default (and no selection) leaves the value
// undefined, so nothing is stored in the watch, just like Signals doesn't store "default" either.
export const toProxyValue = (option) =>
  option && option.value !== PROXY_KEYWORD.DEFAULT ? option.value : undefined;

// Maps a typed value to the "proxy" value of the form. Typed keywords are stored like the picked options.
export const toTypedProxyValue = (value) => {
  const trimmedValue = value.trim();
  const keyword = toKeyword(trimmedValue);
  return keyword ? toProxyValue({ value: keyword }) : trimmedValue || undefined;
};

// Maps the "proxy" string of an action to the selected combo box option.
// Unknown values (inline URLs, ids of proxies the user cannot list) are shown as typed.
export const findSelectedProxyOption = (value, options) => {
  if (!value) return [];

  const keyword = toKeyword(value);
  const option = options.find((o) => o.value === (keyword || value));

  return [option || { label: value, value }];
};
