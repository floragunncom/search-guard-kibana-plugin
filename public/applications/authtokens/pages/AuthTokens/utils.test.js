/** @jest-environment jsdom */
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

import { getResourceEditUri, tokensToUiTokens } from './utils';

describe('AuthTokens/utils', () => {
  test('getResourceEditUri', () => {
    expect(getResourceEditUri('a b')).toBe('/create-auth-token?id=a%20b&action=read-auth-token');
  });

  describe('tokensToUiTokens', () => {
    test('separate tokens into tokens and revoked tokens', () => {
      const revokedAt = Date.now();
      const tokens = [
        { _id: 1, revoked_at: revokedAt },
        { _id: 2, revoked_at: revokedAt },
        { _id: 3 },
        { _id: 4 },
      ];
      const uiTokens = {
        tokens: [{ _id: 3 }, { _id: 4 }],
        revokedTokens: [
          { _id: 1, revoked_at: revokedAt },
          { _id: 2, revoked_at: revokedAt },
        ],
      };

      expect(tokensToUiTokens(tokens)).toEqual(uiTokens);
    });
  });
});
