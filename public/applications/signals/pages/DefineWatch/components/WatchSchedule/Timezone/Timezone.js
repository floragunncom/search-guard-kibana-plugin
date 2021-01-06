/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
