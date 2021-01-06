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

import React, { useContext } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { ContentPanel, FormikFieldText, FormikFieldPassword } from '../../../../components';
import { isInvalid, hasError, validateName, validateEmptyField } from '../../../../utils/validate';
import { AccountsService } from '../../../../services';
import { accountText } from '../../../../utils/i18n/account';
import { nameText, usernameText, authtokenText, urlText } from '../../../../utils/i18n/common';
import { ACCOUNT_TYPE } from '../../../Accounts/utils/constants';

import { Context } from '../../../../Context';

const renderTextField = (path, label, validate) => {
  const formikProps = {};

  if (typeof validate === 'function') {
    formikProps.validate = validate;
  }

  return (
    <FormikFieldText
      name={path}
      formRow
      rowProps={{
        label,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
      formikFieldProps={{ ...formikProps }}
    />
  );
};

const JiraAccount = ({ formik: { values }, id }) => {
  const { httpClient } = useContext(Context);
  const isUpdatingName = id !== values._id;

  return (
    <ContentPanel
      titleSize="s"
      title={
        <p>
          {accountText} {values.type}
        </p>
      }
    >
      {renderTextField(
        '_id',
        nameText,
        validateName(new AccountsService(httpClient, ACCOUNT_TYPE.JIRA), isUpdatingName)
      )}
      {renderTextField('url', urlText, validateEmptyField)}
      {renderTextField('user_name', usernameText, validateEmptyField)}
      <FormikFieldPassword
        name="auth_token"
        formRow
        rowProps={{
          label: authtokenText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
        }}
        formikFieldProps={{ validate: validateEmptyField }}
      />
    </ContentPanel>
  );
};

JiraAccount.protoTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
};

export default connectFormik(JiraAccount);
