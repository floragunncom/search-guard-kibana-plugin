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

import { handleKibanaCapabilities } from './kibana_capabilities';
import { setupHttpResponseMock } from '../../../utils/mocks';

test('handleKibanaCapabilities', () => {
  const response = setupHttpResponseMock();
  const request = {
    body: {
      applications: ['a', 'b', 'c'],
    },
  };

  handleKibanaCapabilities()(null, request, response);
  expect(response.ok).toHaveBeenCalledWith({
    body: {
      a: {},
      b: {},
      c: {},
      dashboard: {},
      observabilityCases: {},
      navLinks: {
        a: true,
        b: true,
        c: true,
      },
    },
  });
});
