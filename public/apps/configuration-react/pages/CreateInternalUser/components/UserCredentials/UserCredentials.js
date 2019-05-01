import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormikFieldText, FormikSwitch } from '../../../../components';
import { hasError, isInvalid, validateTextField } from '../../../../utils/validation';
import {
  i18nUsernameText,
  i18nPasswordText,
  i18nRepeatPasswordText,
  i18nChangePasswordText
} from '../../../../utils/i18n_nodes';

const renderPassword = () => (
  <Fragment>
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateTextField
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
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateTextField
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
        validate: validateTextField
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
    {(!isEdit || values.changePassword) && renderPassword()}
  </Fragment>
);

UserCredentials.propTypes = {
  isEdit: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired
};

export default UserCredentials;
