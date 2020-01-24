import React, { useContext } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { ContentPanel, FormikFieldText, FormikFieldPassword } from '../../../../components';
import { isInvalid, hasError, validateName, validateEmptyField } from '../../../../utils/validate';
import { AccountsService } from '../../../../services';
import { accountText } from '../../../../utils/i18n/account';
import { nameText, integrationkeyText } from '../../../../utils/i18n/common';
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

const PagerdutyAccount = ({ formik: { values }, id }) => {
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
        validateName(new AccountsService(httpClient, ACCOUNT_TYPE.PAGERDUTY), isUpdatingName)
      )}
      <FormikFieldPassword
        name="integration_key"
        formRow
        rowProps={{
          label: integrationkeyText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
          onFocus: (e, field, form) => {
            form.setFieldError(field.name, undefined);
          },
        }}
        formikFieldProps={{ validate: validateEmptyField }}
      />
    </ContentPanel>
  );
};

PagerdutyAccount.protoTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
};

export default connectFormik(PagerdutyAccount);
