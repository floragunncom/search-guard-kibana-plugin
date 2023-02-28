/** @jest-environment jsdom */

/*
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
 * *    Copyright 2021 floragunn GmbH
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
  watchToFormik,
  formikToWatch,
  responseErrorToEditorError,
  responseToEditorResponse,
} from './DefineJsonWatch';

describe('DefineJsonWatch', () => {
  describe('watchToFormik', () => {
    test('can build formik, _ui property deleted', () => {
      const watch = { _ui: {}, _id: 'example' };
      const formik = { _json: JSON.stringify({ _id: 'example' }, null, 2) };

      expect(watchToFormik(watch)).toEqual(formik);
    });
  });

  test('formikToWatch', () => {
    const watch = { _id: 'example', a: 'b' };
    const formik = { _json: JSON.stringify({ _id: 'example', a: 'b' }, null, 2) };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  describe('responseToEditorResponse', () => {
    test('show runtime_attributes as response', () => {
      const input = { runtime_attributes: { a: 'b' } };
      const expected = JSON.stringify({ a: 'b' }, null, 2);

      expect(responseToEditorResponse(input)).toEqual(expected);
    });

    test('show response', () => {
      const input = { a: 'b' };
      const expected = JSON.stringify({ a: 'b' }, null, 2);

      expect(responseToEditorResponse(input)).toEqual(expected);
    });

    test('default response message', () => {
      const input = {};
      const expected = 'Empty response! Something is wrong.';

      expect(responseToEditorResponse(input)).toEqual(expected);
    });
  });

  describe('responseErrorToEditorError', () => {
    test('body error message', () => {
      const input = { body: { a: 'b' } };
      const expected = JSON.stringify({ a: 'b' }, null, 2);

      expect(responseErrorToEditorError(input)).toEqual(expected);
    });

    test('error message', () => {
      const input = new Error('nasty!');
      const expected = 'nasty!';

      expect(responseErrorToEditorError(input)).toEqual(expected);
    });
  });
});
