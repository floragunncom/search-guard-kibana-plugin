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

import {
  buildProxyOptions,
  findSelectedProxyOption,
  DEFAULT_PROXY_LABEL,
  NO_PROXY_LABEL,
} from './buildProxyOptions';

const proxies = [
  { id: 'smops-proxy-connector', name: 'SMOPS proxy', uri: 'http://proxy.example.com:3128' },
  { id: 'plain', name: 'plain', uri: 'http://plain:8080' },
];

describe('buildProxyOptions', () => {
  test('keywords only if there are no stored proxies', () => {
    expect(buildProxyOptions()).toEqual([
      { label: DEFAULT_PROXY_LABEL, value: 'default' },
      { label: NO_PROXY_LABEL, value: 'none' },
    ]);
  });

  test('keywords followed by stored proxies', () => {
    expect(buildProxyOptions(proxies)).toEqual([
      { label: DEFAULT_PROXY_LABEL, value: 'default' },
      { label: NO_PROXY_LABEL, value: 'none' },
      { label: 'SMOPS proxy (smops-proxy-connector)', value: 'smops-proxy-connector' },
      { label: 'plain', value: 'plain' },
    ]);
  });
});

describe('findSelectedProxyOption', () => {
  const options = buildProxyOptions(proxies);

  test('nothing selected for an empty value', () => {
    expect(findSelectedProxyOption('', options)).toEqual([]);
    expect(findSelectedProxyOption(undefined, options)).toEqual([]);
  });

  test('stored proxy', () => {
    expect(findSelectedProxyOption('smops-proxy-connector', options)).toEqual([
      { label: 'SMOPS proxy (smops-proxy-connector)', value: 'smops-proxy-connector' },
    ]);
  });

  test('keywords are case-insensitive', () => {
    expect(findSelectedProxyOption('NONE', options)).toEqual([
      { label: NO_PROXY_LABEL, value: 'none' },
    ]);
  });

  test('inline URL or unknown id is shown as typed', () => {
    expect(findSelectedProxyOption('http://other:3128', options)).toEqual([
      { label: 'http://other:3128', value: 'http://other:3128' },
    ]);
  });
});
