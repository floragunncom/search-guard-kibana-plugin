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

import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { FormikFieldText, FormikFieldPassword, FormikSwitch } from '../../../../components';
import { hasError, isInvalid, validatePassword, validateName } from '../../../../utils/validation';
import {
  usernameText,
  passwordText,
  repeatPasswordText,
  changePasswordText,
} from '../../../../utils/i18n/internal_users';
import { InternalUsersService } from '../../../../services';

import { Context } from '../../../../Context';

const renderPassword = (passwordConfirmation) => (
  <Fragment>
    <FormikFieldPassword
      formRow
      formikFieldProps={{
        validate: validatePassword(passwordConfirmation),
      }}
      rowProps={{
        label: passwordText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
      }}
      name="_password"
    />
    <FormikFieldPassword
      formRow
      formikFieldProps={{
        validate: validatePassword(passwordConfirmation),
      }}
      rowProps={{
        label: repeatPasswordText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
      }}
      name="_passwordConfirmation"
    />
  </Fragment>
);

const UserCredentials = ({ isEdit = false, isUpdatingName, values }) => {
  const { httpClient, onSwitchChange } = useContext(Context);

  return (
    <Fragment>
      <FormikFieldText
        formRow
        formikFieldProps={{
          validate: validateName(new InternalUsersService(httpClient), isUpdatingName),
        }}
        rowProps={{
          label: usernameText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
          onChange: (e, field, form) => {
            form.setFieldValue(field.name, e.target.value);
            if (!form.values._password) form.setFieldValue('_changePassword', true);
          },
        }}
        name="_username"
      />
      {isEdit && (
        <FormikSwitch
          formRow
          elementProps={{
            label: changePasswordText,
            checked: values._changePassword,
            disabled: isUpdatingName,
            onChange: (e, field, form) => {
              const changePasswordAborted = values._changePassword;
              if (changePasswordAborted) {
                form.setValues({
                  ...values,
                  password: '',
                  _passwordConfirmation: '',
                });
              }
              onSwitchChange(e, field, form);
            },
          }}
          name="_changePassword"
        />
      )}
      {(!isEdit || values._changePassword) && renderPassword(values._passwordConfirmation)}
    </Fragment>
  );
};

UserCredentials.propTypes = {
  isEdit: PropTypes.bool.isRequired,
  isUpdatingName: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
};

export default UserCredentials;
