import React, { Fragment } from 'react';
import { FormikFieldText } from '../../../../components';
import { hasError, isInvalid, validateTextField } from '../../../../utils/validation';
import {
  i18nUsernameText,
  i18nPasswordText,
  i18nRepeatPasswordText,
  i18nLeaveEmptyToKeepCurrentPassword
} from '../../../../utils/i18n_nodes';

const UserCredentials = () => (
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
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateTextField
      }}
      rowProps={{
        label: i18nPasswordText,
        isInvalid,
        error: hasError,
        helpText: i18nLeaveEmptyToKeepCurrentPassword
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
        error: hasError,
        helpText: i18nLeaveEmptyToKeepCurrentPassword
      }}
      elementProps={{
        isInvalid
      }}
      name="password_repeat"
    />
  </Fragment>
);

export default UserCredentials;
