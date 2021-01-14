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

import moment from 'moment';
import { cloneDeep, isEmpty } from 'lodash';
import {
  requiredText,
  forbiddenCharsText,
  nameAlreadyExistsText,
  problemWithValidationTryAgainText,
} from '../../utils/i18n/common';

export const EXPIRE_AFTER_UNITS = ['y', 'M', 'w', 'd', 'h', 'm', 's', 'ms'];
export const EXPIRE_AFTER_SELECT_OPTIONS = [
  { value: EXPIRE_AFTER_UNITS[0], text: 'Years' },
  { value: EXPIRE_AFTER_UNITS[1], text: 'Months' },
  { value: EXPIRE_AFTER_UNITS[2], text: 'Weeks' },
  { value: EXPIRE_AFTER_UNITS[3], text: 'Days' },
  { value: EXPIRE_AFTER_UNITS[4], text: 'Hours' },
  { value: EXPIRE_AFTER_UNITS[5], text: 'Minutes' },
  { value: EXPIRE_AFTER_UNITS[6], text: 'Seconds' },
  { value: EXPIRE_AFTER_UNITS[7], text: 'Milliseconds' },
];

const DEFAULT_RESOURCE = {
  _name: '',
  _expires_after: { value: 24, unit: 'h' },
  _isRequestedJSON: false,
  _requested: JSON.stringify(
    {
      index_permissions: [
        {
          index_patterns: ['*'],
          allowed_actions: ['*'],
        },
      ],
      tenant_permissions: [
        {
          tenant_patterns: ['*'],
          allowed_actions: ['*'],
        },
      ],
      cluster_permissions: ['*'],
    },
    null,
    2
  ),
};

export function tokenToFormik(token = {}, props = {}) {
  // Return the defaults when a new token created.
  if (!Object.keys(token).length) {
    return DEFAULT_RESOURCE;
  }

  return {
    ...DEFAULT_RESOURCE,
    ...cloneDeep(token),
    _name: token.token_name,
    _expires_after: buildUiExpiresAfter(token.expires_at),
    _requested: JSON.stringify(token.requested, null, 2),
    ...props,
  };
}

export function formikToToken(formik = {}) {
  if (!Object.keys(formik).length) return null;

  const token = cloneDeep(formik);

  // Save the values.
  token.name = token._name;
  token.requested = JSON.parse(token._requested);
  token.expires_after = buildExpiresAfter(token._expires_after);

  // Delete meta and empty values.
  delete token.token_name;
  delete token.base;
  for (const [key, value] of Object.entries(token)) {
    if (key.startsWith('_') || (!Number.isFinite(value) && isEmpty(value))) {
      delete token[key];
    }
  }

  return token;
}

export function buildUiExpiresAfter(aTimeMS, bTimeMS = moment()) {
  for (const unit of EXPIRE_AFTER_UNITS) {
    const value = Math.abs(moment(aTimeMS).diff(bTimeMS, unit));
    if (value > 0) return { value, unit };
  }

  return { value: 24, unit: 'h' };
}

export function buildExpiresAfter({ value, unit }) {
  return value + unit;
}
