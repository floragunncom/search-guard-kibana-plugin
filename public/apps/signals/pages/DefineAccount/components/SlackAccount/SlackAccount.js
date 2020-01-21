import React from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import {
  ContentPanel,
  FormikFieldText
} from '../../../../components';
import { AccountsService } from '../../../../services';
import {
  isInvalid,
  hasError,
  validateName,
  validateEmptyField
} from '../../../../utils/validate';
import {
  accountText
} from '../../../../utils/i18n/account';
import { nameText, urlText } from '../../../../utils/i18n/common';
import { ACCOUNT_TYPE } from '../../../Accounts/utils/constants';

const SlackAccount = ({ httpClient, id, formik: { values } }) => {
  const isUpdatingName = id !== values._id;

  return (
    <ContentPanel
      title={(<p>{accountText} {values.type}</p>)}
      titleSize="s"
    >
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
          )
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
          validate: validateEmptyField
        }}
      />
    </ContentPanel>
  );
};

SlackAccount.propTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
  httpClient: PropTypes.func.isRequired
};

export default connectFormik(SlackAccount);
