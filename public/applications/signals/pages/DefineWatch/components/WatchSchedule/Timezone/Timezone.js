import React from 'react';
import moment from 'moment-timezone';
import { FormikComboBox } from '../../../../../components';
import { arrayToComboBoxOptions } from '../../../../../utils/helpers';
import { isInvalid, hasError, validateEmptyArray } from '../../../../../utils/validate';
import { timezoneText } from '../../../../../utils/i18n/watch';

const Timezone = () => (
  <FormikComboBox
    name="_ui.timezone"
    formRow
    formikFieldProps={{ validate: validateEmptyArray }}
    rowProps={{
      label: timezoneText,
      isInvalid,
      error: hasError,
    }}
    elementProps={{
      isClearable: false,
      singleSelection: { asPlainText: true },
      placeholder: 'Select timezone',
      options: arrayToComboBoxOptions(moment.tz.names()),
      onBlur: (e, field, form) => {
        form.setFieldTouched(field.name, true);
      },
      onChange: (options, field, form) => {
        form.setFieldValue(field.name, options);
      },
      'data-test-subj': 'sgTimezoneComboBox',
    }}
  />
);

export default Timezone;
