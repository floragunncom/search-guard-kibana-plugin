import React from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import {
  ContentPanel,
  FormikFieldText
} from '../../../../components';
import { DestinationsService } from '../../../../services';
import {
  isInvalid,
  hasError,
  validateName,
  validateEmptyField
} from '../../../../utils/validate';
import {
  destinationText
} from '../../../../utils/i18n/destination';
import { nameText, urlText } from '../../../../utils/i18n/common';

const SlackDestination = ({ httpClient, id, formik: { values } }) => {
  const isUpdatingName = id !== values._id;

  return (
    <ContentPanel
      title={(<p>{destinationText} {values.type}</p>)}
      titleSize="s"
      bodyStyles={{ padding: 'initial', paddingLeft: '10px' }}
    >
      <FormikFieldText
        name="_id"
        formRow
        rowProps={{
          label: nameText,
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
        }}
        formikFieldProps={{
          validate: validateName(new DestinationsService(httpClient), isUpdatingName)
        }}
      />
      <FormikFieldText
        name="url"
        formRow
        rowProps={{
          label: urlText,
          style: { paddingLeft: '10px' },
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

SlackDestination.propTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
  httpClient: PropTypes.func.isRequired
};

export default connectFormik(SlackDestination);
