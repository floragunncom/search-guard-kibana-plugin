import React from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import {
  ContentPanel,
  FormikFieldText,
  FormikFieldNumber
} from '../../../../components';
import { DestinationsService } from '../../../../services';
import {
  isInvalid,
  hasError,
  validateName,
  validateEmptyField
} from '../../../../utils/validate';
import {
  destinationText,
  hostText,
  portText,
  mimeLayoutText,
  sessionTimeoutText,
  defaultSubjectText
} from '../../../../utils/i18n/destination';
import { nameText } from '../../../../utils/i18n/common';

const EmailDestination = ({ httpClient, id, formik: { values } }) => {
  const isUpdatingName = id !== values._id;

  return (
    <ContentPanel
      title={destinationText}
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
        name="host"
        formRow
        rowProps={{
          label: hostText,
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
      <FormikFieldNumber
        name="port"
        formRow
        rowProps={{
          label: portText,
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
      <FormikFieldText
        name="mime_layout"
        formRow
        rowProps={{
          label: mimeLayoutText,
          style: { paddingLeft: '10px' },
        }}
      />
      <FormikFieldNumber
        name="session_timeout"
        formRow
        rowProps={{
          label: sessionTimeoutText,
          style: { paddingLeft: '10px' },
        }}
      />
      <FormikFieldText
        name="default_subject"
        formRow
        rowProps={{
          label: defaultSubjectText,
          style: { paddingLeft: '10px' },
        }}
      />
    </ContentPanel>
  );
};

EmailDestination.propTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
  httpClient: PropTypes.func.isRequired
};

export default connectFormik(EmailDestination);
