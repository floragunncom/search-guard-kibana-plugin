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

export function wrapForCustomError(error) {
  if (!(error instanceof Error)) {
    throw new Error('The provided argument must be instance of Error.');
  }

  const customError = {
    statusCode: error.statusCode || error.inner?.meta?.statusCode || 500,
    body: { message: error.inner?.meta?.body?.message || error.message || 'Internal Server Error' },
  };

  if (error.body) {
    customError.body.attributes = { body: error.body };
  }

  return customError;
}
