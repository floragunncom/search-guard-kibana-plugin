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

import { validateName } from './validateName';
import {
  requiredText,
  problemWithValidationTryAgainText,
  nameAlreadyExistsText,
  forbiddenCharsText,
} from '../i18n/common';

describe('validate_name', () => {
  it('can validate unique name', async () => {
    const Service = {
      get: () => Promise.reject({ body: { statusCode: 404 } }),
    };

    await expect(validateName(Service)('newName')).resolves.toBe(null);
  });

  it('fail to validate empty name', async () => {
    await expect(validateName()('')).resolves.toBe(requiredText);
  });

  it('fail to validate if name exists', async () => {
    const Service = {
      get: () => Promise.resolve({ resp: { _id: '123' } }),
    };

    const isUpdatingName = 'true';
    await expect(validateName(Service, isUpdatingName)('123')).resolves.toBe(nameAlreadyExistsText);
  });

  it('fail to validate because service fails', async () => {
    const Service = {};
    Service.get = jest.fn();
    Service.get.mockReturnValue(
      Promise.reject({ body: { statusCode: 500, message: 'Internal Server Error' } })
    );
    await expect(validateName(Service)('123')).resolves.toBe(problemWithValidationTryAgainText);
  });

  test('forbidden chars', async () => {
    const Service = jest.fn();
    const expected = forbiddenCharsText;
    const inputs = [
      {
        input: 'abc.',
        expected,
      },
      {
        input: 'abc*',
        expected,
      },
      {
        input: 'abc/',
        expected,
      },
    ];

    for (let i = 0; i < inputs.length; i++) {
      const { input, expected } = inputs[i];
      expect(await validateName(Service)(input)).toBe(expected);
    }
  });

  test('allowed chars', async () => {
    const expected = null;
    const inputs = [
      {
        input: 'abc#',
        expected,
      },
      {
        input: 'abc&',
        expected,
      },
      {
        input: 'abc+',
        expected,
      },
      {
        input: 'abc\\',
        expected,
      },
      {
        input: 'abc1',
        expected,
      },
      {
        input: 'abc d',
        expected,
      },
      {
        input: 'abc',
        expected,
      },
      {
        input: 'abc_',
        expected,
      },
      {
        input: 'abc-',
        expected,
      },
      {
        input: 'abc!',
        expected,
      },
      {
        input: 'abc~',
        expected,
      },
      {
        input: 'abc(',
        expected,
      },
      {
        input: 'abc)',
        expected,
      },
      {
        input: 'abc',
        expected,
      },
      {
        input: 'abc;',
        expected,
      },
      {
        input: 'abc?,',
        expected,
      },
      {
        input: 'abc:',
        expected,
      },
      {
        input: 'abc@',
        expected,
      },
      {
        input: 'abc=',
        expected,
      },
      {
        input: 'abc$',
        expected,
      },
      {
        input: 'abc}',
        expected,
      },
      {
        input: 'abc]',
        expected,
      },
    ];

    for (let i = 0; i < inputs.length; i++) {
      const { input, expected } = inputs[i];
      const Service = { get: jest.fn().mockResolvedValue({ resp: { _id: input } }) };
      expect(await validateName(Service)(input)).toBe(expected);
    }
  });
});
