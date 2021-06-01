/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { EuiSpacer } from '@elastic/eui';
import { ContentPanel, FormikFieldText, FormikErrorsCallOut } from '../../../../components';
import { AccountsService } from '../../../../services';
import { isInvalid, hasError, validateName, validateEmptyField } from '../../../../utils/validate';
import { accountText } from '../../../../utils/i18n/account';
import { nameText, urlText } from '../../../../utils/i18n/common';
import { ACCOUNT_TYPE } from '../../../Accounts/utils/constants';

import { Context } from '../../../../Context';

const SlackAccount = ({ id, formik: { values, errors } }) => {
  const { httpClient } = useContext(Context);
  const isUpdatingName = id !== values._id;

  return (
    <ContentPanel
      title={
        <p>
          {accountText} {values.type}
        </p>
      }
      titleSize="s"
    >
      <FormikErrorsCallOut errors={errors} />
      <EuiSpacer />

      <FormikFieldText
        name="_id"
        formRow
        rowProps={{
          label: nameText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
        }}
        formikFieldProps={{
          validate: validateName(
            new AccountsService(httpClient, ACCOUNT_TYPE.SLACK),
            isUpdatingName
          ),
        }}
      />
      <FormikFieldText
        name="url"
        formRow
        rowProps={{
          label: urlText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
        }}
        formikFieldProps={{
          validate: validateEmptyField,
        }}
      />
    </ContentPanel>
  );
};

SlackAccount.propTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
};

export default connectFormik(SlackAccount);
