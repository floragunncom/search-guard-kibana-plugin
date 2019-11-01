import React from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox } from '../../../../../components';
import buildActionAccounts from './utils/buildActionAccounts';
import { isInvalid, hasError, validateEmptyArray } from '../../../../../utils/validate';
import { accountText } from '../../../../../utils/i18n/account';
import { ACCOUNT_TYPE } from '../../../../Accounts/utils/constants';

const ActionAccount = ({
  index,
  accounts,
  accountType
}) => (
  <FormikComboBox
    name={`actions[${index}].account`}
    formRow
    formikFieldProps={{ validate: validateEmptyArray }}
    rowProps={{
      label: accountText,
      isInvalid,
      error: hasError,
      style: { paddingLeft: '0px' },
    }}
    elementProps={{
      isClearable: false,
      singleSelection: { asPlainText: true },
      placeholder: 'Select account',
      async: true,
      options: buildActionAccounts(accounts, accountType),
      onBlur: (e, field, form) => {
        form.setFieldTouched(field.name, true);
      },
      onChange: (options, field, form) => {
        form.setFieldValue(field.name, options);
      },
      'data-test-subj': 'sgAccountsComboBox',
    }}
  />
);

ActionAccount.propTypes = {
  index: PropTypes.number.isRequired,
  accounts: PropTypes.array.isRequired,
  accountType: PropTypes.oneOf([
    ACCOUNT_TYPE.SLACK,
    ACCOUNT_TYPE.EMAIL
  ]).isRequired
};

export default ActionAccount;
