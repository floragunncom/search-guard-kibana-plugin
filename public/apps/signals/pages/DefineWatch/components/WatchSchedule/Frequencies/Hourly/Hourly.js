/*
 *    Copyright 2019 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import React from 'react';
import { FormikComboBox } from '../../../../../../components';
import {
  minutesText,
  mustSelectAMinuteText,
  invalidMinuteValuesText,
} from '../../../../../../utils/i18n/watch';
import { isInvalid, hasError } from '../../../../utils/validate';

const validateMinutes = values => {
  if (values.length === 0) {
    return mustSelectAMinuteText;
  }

  const invalidValues = values
    .map(value => value.label)
    .filter(value => {
      try {
        value = parseInt(value, 10);
      } catch (error) {
        // Ignore
      }

      if (!Number.isInteger(value) || (value < 0 || value > 59)) {
        return true;
      }
      return false;
    });

  if (invalidValues.length) {
    return invalidMinuteValuesText;
  }

  return null;
};

const Hourly = () => {
  // arrayToComboBox sorts the integer values wrong, hence the "duplication" here
  const options = [...Array(60).keys()].map(key => ({ label: key.toString() }));

  return (
    <FormikComboBox
      name="_ui.hourly"
      formRow
      rowProps={{
        label: minutesText,
        isInvalid,
        error: hasError,
      }}
      formikFieldProps={{
        validate: validateMinutes,
      }}
      elementProps={{
        noSuggestions: false,
        options: options,
        isClearable: true,
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
        onChange: (options, field, form) => {
          form.setFieldValue(field.name, options);
        },
      }}
    />
  );
};

export default Hourly;
