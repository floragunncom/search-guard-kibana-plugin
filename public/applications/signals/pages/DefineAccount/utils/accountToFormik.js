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
