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

import { arrayToComboBoxOptions } from '../../../utils/helpers';
import { ACCOUNT_TYPE } from '../../Accounts/utils/constants';
import * as DEFAULTS from './defaults';

export function buildFormikPagerdutyAccount(account) {
  return { ...DEFAULTS[ACCOUNT_TYPE.PAGERDUTY], ...account };
}

export function buildFormikJiraAccount(account) {
  return { ...DEFAULTS[ACCOUNT_TYPE.JIRA], ...account };
}

export function buildFormikSlackAccount(account) {
  return { ...DEFAULTS[ACCOUNT_TYPE.SLACK], ...account };
}

export function buildFormikEmailAccount(account) {
  return {
    ...DEFAULTS[ACCOUNT_TYPE.EMAIL],
    ...Object.keys(account).reduce((acc, field) => {
      if (['default_cc', 'default_to', 'default_bcc', 'trusted_hosts'].includes(field)) {
        acc[field] = arrayToComboBoxOptions(account[field]);
      } else {
        acc[field] = account[field];
      }
      return acc;
    }, {}),
  };
}

export function accountToFormik(account) {
  let formik;

  switch (account.type) {
    case ACCOUNT_TYPE.SLACK: {
      formik = buildFormikSlackAccount(account);
      break;
    }
    case ACCOUNT_TYPE.JIRA: {
      formik = buildFormikJiraAccount(account);
      break;
    }
    case ACCOUNT_TYPE.PAGERDUTY: {
      formik = buildFormikPagerdutyAccount(account);
      break;
    }
    default: {
      formik = buildFormikEmailAccount(account);
    }
  }

  return formik;
}
