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

import { get } from 'lodash';
import Boom from 'boom';
import AuthenticationError from '../../auth/errors/authentication_error';

/**
 * Wraps an Elasticsearch client error into a backend error.
 *
 * @param {Error} error - An Elasticsearch client error.
 */
export default function wrapElasticsearchError(error) {
  let statusCode = error.statusCode;

  if (error.status) {
    statusCode = error.status;
  }

  if (!statusCode) {
    statusCode = 500;
  }

  let message = get(error, 'body.message');
  if (!message) {
    message = error.message;
  }

  if (statusCode === 401) {
    return new AuthenticationError(message, error);
  }

  return Boom.boomify(error, { statusCode, message });
}
