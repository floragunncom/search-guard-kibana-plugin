import { comboBoxOptionsToArray, filterEmptyKeys } from '../../../utils/helpers';
import { ACCOUNT_TYPE } from '../../Accounts/utils/constants';

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
    default: {
      account = buildEmailAccount(formik);
    }
  }

  return filterEmptyKeys(account);
}
