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
import { DESTINATION_TYPE } from '../../../Destinations/utils/constants';

const SlackDestination = ({ httpClient, id, formik: { values } }) => {
  const isUpdatingName = id !== values._id;

  return (
    <ContentPanel
      title={(<p>{destinationText} {values.type}</p>)}
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
            new DestinationsService(httpClient, DESTINATION_TYPE.SLACK),
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

SlackDestination.propTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
  httpClient: PropTypes.func.isRequired
};

export default connectFormik(SlackDestination);
