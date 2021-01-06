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

import { comboBoxOptionsToArray, filterEmptyKeys } from '../../../utils/helpers';
import { ACCOUNT_TYPE } from '../../Accounts/utils/constants';

export function buildPagerdutyAccount(formik) {
  return { ...formik };
}

export function buildJiraAccount(formik) {
  return { ...formik };
}

export function buildSlackAccount(formik) {
  return { ...formik };
}

export function buildEmailAccount(formik) {
  return Object.keys(formik).reduce((acc, field) => {
    if (['default_cc', 'default_to', 'default_bcc', 'trusted_hosts'].includes(field)) {
      acc[field] = comboBoxOptionsToArray(formik[field]);
    } else {
      acc[field] = formik[field];
    }

    return acc;
  }, {});
}

export function formikToAccount(formik) {
  let account;

  switch (formik.type) {
    case ACCOUNT_TYPE.SLACK: {
      account = buildSlackAccount(formik);
      break;
    }
    case ACCOUNT_TYPE.JIRA: {
      account = buildJiraAccount(formik);
      break;
    }
    case ACCOUNT_TYPE.PAGERDUTY: {
      account = buildPagerdutyAccount(formik);
      break;
    }
    default: {
      account = buildEmailAccount(formik);
    }
  }

  return filterEmptyKeys(account);
}
