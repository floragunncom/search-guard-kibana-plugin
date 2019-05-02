import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormikFieldText, FormikFieldPassword, FormikSwitch } from '../../../../components';
import { hasError, isInvalid, validatePassword, validateInternalUserName } from '../../../../utils/validation';
import {
  i18nUsernameText,
  i18nPasswordText,
  i18nRepeatPasswordText,
  i18nChangePasswordText
} from '../../../../utils/i18n_nodes';

const renderPassword = passwordConfirmation => (
  <Fragment>
    <FormikFieldPassword
      formRow
      formikFieldProps={{
        validate: validatePassword(passwordConfirmation)
      }}
      rowProps={{
        label: i18nPasswordText,
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
        label: i18nRepeatPasswordText,
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

const UserCredentials = ({ isEdit = false, values, users }) => (
  <Fragment>
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateInternalUserName({ users, isEdit })
      }}
      rowProps={{
        label: i18nUsernameText,
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
          label: i18nChangePasswordText,
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
  users: PropTypes.array.isRequired
};

export default UserCredentials;
