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

import React from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox } from '../../../../../components';
import buildActionAccounts from './utils/buildActionAccounts';
import { isInvalid, hasError, validateEmptyArray } from '../../../../../utils/validate';
import { accountText } from '../../../../../utils/i18n/account';
import { ACCOUNT_TYPE } from '../../../../Accounts/utils/constants';

const ActionAccount = ({ isResolveActions, index, accounts, accountType }) => {
  const path = isResolveActions ? `resolve_actions[${index}].account` : `actions[${index}].account`;

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
