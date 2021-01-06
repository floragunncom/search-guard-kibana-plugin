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

import { watchToFormik } from './watchToFormik';

describe('watchToFormik', () => {
  test('can put state in _ui meta', () => {
    const watch = { a: 1 };
    const state = { b: 2 };
    const formik = { a: 1, _ui: { state: { b: 2 } } };

    expect(watchToFormik(watch, state)).toEqual(formik);
  });
});
