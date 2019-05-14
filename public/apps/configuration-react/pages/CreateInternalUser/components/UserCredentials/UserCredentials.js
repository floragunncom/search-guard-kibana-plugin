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
      name="passwordConfirmation"
    />
  </Fragment>
);

const UserCredentials = ({ isEdit = false, values, allUsers }) => (
  <Fragment>
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateInternalUserName({ allUsers, isEdit })
      }}
      rowProps={{
        label: usernameText,
        isInvalid,
        error: hasError
      }}
      elementProps={{
        isInvalid
      }}
      name="username"
    />
    {isEdit && (
      <FormikSwitch
        formRow
        elementProps={{
          label: changePasswordText,
          onChange: (e, field, form) => {
            const changePasswordAborted = values.changePassword;
            if (changePasswordAborted) {
              form.setValues({
                ...values,
                password: '',
                passwordConfirmation: ''
              });
            }
            field.onChange(e);
          }
        }}
        name="changePassword"
      />
    )}
    {(!isEdit || values.changePassword) && renderPassword(values.passwordConfirmation)}
  </Fragment>
);

UserCredentials.propTypes = {
  isEdit: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
  allUsers: PropTypes.array.isRequired
};

export default UserCredentials;
