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

const renderPassword = passwordRepeat => (
  <Fragment>
    <FormikFieldPassword
      formRow
      formikFieldProps={{
        validate: validatePassword(passwordRepeat)
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
        validate: validatePassword(passwordRepeat)
      }}
      rowProps={{
        label: i18nRepeatPasswordText,
        isInvalid,
        error: hasError
      }}
      elementProps={{
        isInvalid
      }}
      name="passwordRepeat"
    />
  </Fragment>
);

const UserCredentials = ({ isEdit = false, values }) => (
  <Fragment>
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateInternalUserName
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
                passwordRepeat: ''
              });
            }
            field.onChange(e);
          }
        }}
        name="changePassword"
      />
    )}
    {(!isEdit || values.changePassword) && renderPassword(values.passwordRepeat)}
  </Fragment>
);

UserCredentials.propTypes = {
  isEdit: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired
};

export default UserCredentials;
