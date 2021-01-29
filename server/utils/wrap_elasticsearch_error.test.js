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

import { wrapForCustomError } from './wrap_elasticsearch_error';

describe('wrap_for_custom_error', () => {
  test('fail to wrap if it is not an instance of Error', async () => {
    const error = new Error('The provided argument must be instance of Error.');

    try {
      wrapForCustomError({});
    } catch (err) {
      expect(error).toEqual(error);
    }
  });

  test('wrap error', async () => {
    const error = new Error('nasty!');
    error.statusCode = 401;
    error.body = { error: { reason: 'too much' } };

    const expected = {
      body: {
        attributes: {
          body: {
            error: {
              reason: 'too much',
            },
          },
        },
        message: 'nasty!',
      },
      statusCode: 401,
    };

    expect(wrapForCustomError(error)).toEqual(expected);
  });

  test('internal server error', async () => {
    const errors = [
      {
        error: new Error('nasty!'),
        expected: {
          body: {
            message: 'nasty!',
          },
          statusCode: 500,
        },
      },
      {
        error: new Error(),
        expected: {
          body: {
            message: 'Internal Server Error',
          },
          statusCode: 500,
        },
      },
    ];

    for (const { error, expected } of errors) {
      expect(wrapForCustomError(error)).toEqual(expected);
    }
  });
});
