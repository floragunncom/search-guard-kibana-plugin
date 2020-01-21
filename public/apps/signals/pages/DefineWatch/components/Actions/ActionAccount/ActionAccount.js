import React from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox } from '../../../../../components';
import buildActionAccounts from './utils/buildActionAccounts';
import { isInvalid, hasError, validateEmptyArray } from '../../../../../utils/validate';
import { accountText } from '../../../../../utils/i18n/account';
import { ACCOUNT_TYPE } from '../../../../Accounts/utils/constants';

const ActionAccount = ({
  isResolveActions,
  index,
  accounts,
  accountType
}) => {
  const path = isResolveActions
    ? `resolve_actions[${index}].account`
    : `actions[${index}].account`;

  return (
    <FormikComboBox
      name={path}
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
};

ActionAccount.propTypes = {
  isResolveActions: PropTypes.bool,
  index: PropTypes.number.isRequired,
  accounts: PropTypes.array.isRequired,
  accountType: PropTypes.oneOf([
    ACCOUNT_TYPE.SLACK,
    ACCOUNT_TYPE.EMAIL,
    ACCOUNT_TYPE.JIRA,
    ACCOUNT_TYPE.PAGERDUTY,
  ]).isRequired,
};

export default ActionAccount;
