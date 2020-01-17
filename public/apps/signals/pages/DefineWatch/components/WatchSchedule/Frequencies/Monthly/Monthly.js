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

/*
  * Copyright 2015-2019 _floragunn_ GmbH
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

import React, { Fragment } from 'react';
import { EuiFlexItem, EuiFlexGroup, EuiSpacer } from '@elastic/eui';

import Daily from '../Daily';
import { FormikFieldNumber, FormikSelect } from '../../../../../../components';
import { isInvalid, hasError, validateMonthDay } from '../../../../utils/validate';
import { onText } from '../../../../../../utils/i18n/watch';
import { MONTHLYTYPES } from './utils/constants';

const Monthly = () => (
  <Fragment>
    <EuiSpacer size="m" />
    <EuiFlexGroup alignItems="flexEnd" style={{ maxWidth: '425px' }}>
      <EuiFlexItem>
        <FormikSelect
          name="_ui.monthly.type"
          formRow
          rowProps={{
            label: onText,
            isInvalid,
            error: hasError,
          }}
          elementProps={{
            options: MONTHLYTYPES,
            onChange: (e, field, form) => {
              form.setFieldValue('_ui.monthly.type', e.target.value);
            },
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <FormikFieldNumber
          name="_ui.monthly.day"
          formRow
          formikFieldProps={{ validate: validateMonthDay }}
          rowProps={{
            isInvalid,
            error: hasError,
            hasEmptyLabelSpace: false,
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>

    <EuiSpacer size="m" />
    <Daily />
  </Fragment>
);

export default Monthly;
