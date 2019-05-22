import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormikFieldText, FormikFieldPassword, FormikSwitch } from '../../../../components';
import { hasError, isInvalid, validatePassword, validateInternalUserName } from '../../../../utils/validation';
import {
  usernameText,
  passwordText,
  repeatPasswordText,
  changePasswordText
} from '../../../../utils/i18n/internal_users';

const renderPassword = passwordConfirmation => (
  <Fragment>
    <FormikFieldPassword
      formRow
      formikFieldProps={{
        validate: validatePassword(passwordConfirmation)
      }}
      rowProps={{
        label: passwordText,
        isInvalid,
        error: hasError
      }}
      elementProps={{
        isInvalid
      }}
      name="password"
    />
    <FormikFieldPassword
      formRow
      formikFieldProps={{
        validate: validatePassword(passwordConfirmation)
      }}
      rowProps={{
        label: repeatPasswordText,
        isInvalid,
        error: hasError
      }}
      elementProps={{
        isInvalid
      }}
      name="_passwordConfirmation"
    />
  </Fragment>
);

const UserCredentials = ({ isEdit = false, isUpdatingName, values, internalUsersService }) => (
  <Fragment>
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateInternalUserName(internalUsersService, isUpdatingName)
      }}
      rowProps={{
        label: usernameText,
        isInvalid,
        error: hasError
      }}
      elementProps={{
        isInvalid
      }}
      name="_username"
    />
    {isEdit && (
      <FormikSwitch
        formRow
        elementProps={{
          label: changePasswordText,
          onChange: (e, field, form) => {
            const changePasswordAborted = values._changePassword;
            if (changePasswordAborted) {
              form.setValues({
                ...values,
                password: '',
                _passwordConfirmation: ''
              });
            }
            field.onChange(e);
          }
        }}
        name="_changePassword"
      />
    )}
    {(!isEdit || values._changePassword) && renderPassword(values._passwordConfirmation)}
  </Fragment>
);

UserCredentials.propTypes = {
  isEdit: PropTypes.bool.isRequired,
  isUpdatingName: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
  internalUsersService: PropTypes.object.isRequired
};

export default UserCredentials;
