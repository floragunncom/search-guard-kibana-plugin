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

import { getDefaultSpaceDoc } from './spaces_service';

describe('SpacesService', () => {
  test('create the default space document', () => {
    expect(getDefaultSpaceDoc('7.12.0')).toEqual({
      space: {
        name: 'Default',
        description: 'This is your default space!',
        disabledFeatures: [],
        color: '#00bfb3',
        _reserved: true,
      },
      type: 'space',
      references: [],
      managed: false,
      typeMigrationVersion: '6.6.0',
      coreMigrationVersion: "7.12.0",
      updated_at: expect.any(String),
      created_at: expect.any(String),
    });
  });
});
