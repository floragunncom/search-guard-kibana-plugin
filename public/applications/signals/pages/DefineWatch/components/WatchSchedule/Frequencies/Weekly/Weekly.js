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

import React, { Fragment } from 'react';
import { Field } from 'formik';
import { startCase, get } from 'lodash';
import { EuiFormRow, EuiFlexGroup, EuiFlexItem, EuiCheckbox } from '@elastic/eui';
import Daily from '../Daily';
import { everyText, mustSelectADayText } from '../../../../../../utils/i18n/watch';
import { DAYS } from './utils/constants';

const checkboxFlexItem = (day, checked, setFieldValue, setFieldTouched) => (
  <EuiFlexItem key={day} grow={false} style={{ marginRight: '0px', zIndex: 0 }}>
    <EuiCheckbox
      id={day}
      label={startCase(day)}
      checked={checked}
      onChange={(e) => {
        setFieldValue(`_ui.weekly.${day}`, e.target.checked);
      }}
      onBlur={() => setFieldTouched('_ui.weekly')}
      compressed
    />
  </EuiFlexItem>
);

const validate = (value) => {
  return !Object.values(value).some((v) => v) ? mustSelectADayText : null;
};

const Weekly = () => (
  <Fragment>
    <Field name="_ui.weekly" validate={validate}>
      {({ field: { value }, form: { touched, errors, setFieldValue, setFieldTouched } }) => {
        return (
          <EuiFormRow
            label={everyText}
            isInvalid={get(touched, '_ui.weekly') && !!get(errors, '_ui.weekly')}
            error={get(errors, '_ui.weekly')}
          >
            <EuiFlexGroup alignItems="center">
              {DAYS.map((day) => checkboxFlexItem(day, value[day], setFieldValue, setFieldTouched))}
            </EuiFlexGroup>
          </EuiFormRow>
        );
      }}
    </Field>
    <Daily />
  </Fragment>
);

export default Weekly;
