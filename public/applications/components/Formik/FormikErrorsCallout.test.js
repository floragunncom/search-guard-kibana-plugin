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

import React from 'react';
import { formikErrorsToErrors } from './FormikErrorsCallout';

describe('FormikErrorsCallOut', () => {
  describe('formikErrorsToErrors', () => {
    test('can get errors from formik errors', () => {
      const formikErrors = {
        a: 'a',
        b: 'b',
        c: <p>c</p>,
        d: null,
        e: {},
        f: [],
        g: 1,
        h: undefined,
        i: { g: { k: 'k' } },
        l: [{ m: 'm' }, { n: 'n' }],
      };
      const errors = ['a', 'b', <p>c</p>, 'k', 'm', 'n'];

      expect(formikErrorsToErrors({ errors: formikErrors, maxMessages: 6 })).toEqual(errors);
    });

    test('max messages = 2', () => {
      const formikErrors = { a: 'a', b: 'b', c: 'c' };
      const errors = ['a', 'b'];

      expect(formikErrorsToErrors({ errors: formikErrors, maxMessages: 2 })).toEqual(errors);
    });

    test('max depth = 2', () => {
      const formikErrors = { a: 'a', b: { c: { d: 'd' } } };
      const errors = ['a'];

      expect(formikErrorsToErrors({ errors: formikErrors, maxDepth: 2 })).toEqual(errors);
    });
  });
});
