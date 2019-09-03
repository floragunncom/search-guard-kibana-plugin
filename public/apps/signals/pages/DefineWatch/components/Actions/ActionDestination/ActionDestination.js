import React from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox } from '../../../../../components';
import buildActionAccounts from './utils/buildActionAccounts';
import { isInvalid, hasError, validateEmptyArray } from '../../../../../utils/validate';
import { destinationText } from '../../../../../utils/i18n/destination';
import { DESTINATION_TYPE } from '../../../../Destinations/utils/constants';

const ActionDestination = ({
  index,
  destinations,
  destinationType
}) => (
  <FormikComboBox
    name={`actions[${index}].account`}
    formRow
    formikFieldProps={{ validate: validateEmptyArray }}
    rowProps={{
      label: destinationText,
      isInvalid,
      error: hasError,
      style: { paddingLeft: '0px' },
    }}
    elementProps={{
      isClearable: false,
      singleSelection: { asPlainText: true },
      placeholder: 'Select destination',
      async: true,
      options: buildActionAccounts(destinations, destinationType),
      onBlur: (e, field, form) => {
        form.setFieldTouched(field.name, true);
      },
      onChange: (options, field, form) => {
        form.setFieldValue(field.name, options);
      },
      'data-test-subj': 'sgDestinationsComboBox',
    }}
  />
);

ActionDestination.propTypes = {
  index: PropTypes.number.isRequired,
  destinations: PropTypes.array.isRequired,
  destinationType: PropTypes.oneOf([
    DESTINATION_TYPE.SLACK,
    DESTINATION_TYPE.EMAIL
  ]).isRequired
};

export default ActionDestination;
