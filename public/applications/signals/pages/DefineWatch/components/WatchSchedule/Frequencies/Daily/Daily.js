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

/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React from 'react';
import { Field } from 'formik';
import moment from 'moment';
import { EuiFormRow, EuiDatePicker } from '@elastic/eui';
import { aroundText } from '../../../../../../utils/i18n/watch';

const Daily = () => (
  <Field name="_ui.daily">
    {({
      // eslint-disable-next-line no-unused-vars
      field: { value, onChange, onBlur, ...rest },
      form: { setFieldValue },
    }) => (
      <EuiFormRow label={aroundText}>
        <EuiDatePicker
          showTimeSelect
          showTimeSelectOnly
          selected={moment().hours(value).minutes(0)}
          onChange={(date) => {
            setFieldValue('_ui.daily', date.hours());
          }}
          dateFormat="hh:mm A"
          timeIntervals={60}
          {...rest}
        />
      </EuiFormRow>
    )}
  </Field>
);

export default Daily;
