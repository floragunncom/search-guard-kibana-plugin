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
  * Copyright 2015-2018 _floragunn_ GmbH
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
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';

import Daily from '../Daily';
import { FormikFieldNumber, FormikSelect } from '../../../../../../components';
import { isInvalid, hasError, validateMonthDay } from '../../../../../../utils/validate';
import { onText } from '../../../../../../utils/i18n/watch';
import { MONTHLYTYPES } from './utils/constants';

const Monthly = () => (
  <Fragment>
    <EuiFlexGroup alignItems="flexEnd" style={{ paddingLeft: '10px', marginTop: '5px' }}>
      <EuiFlexItem style={{ marginTop: '0px' }}>
        <FormikSelect
          name="_monthly.type"
          formRow
          rowProps={{
            label: onText,
            isInvalid,
            error: hasError,
            style: { marginTop: '0px' },
          }}
          elementProps={{
            options: MONTHLYTYPES,
            onChange: (e, field, form) => {
              form.setFieldValue('_monthly.type', e.target.value);
            },
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem style={{ marginTop: '0px' }}>
        <FormikFieldNumber
          name="_monthly.day"
          formRow
          formikFieldProps={{ validate: validateMonthDay }}
          rowProps={{
            isInvalid,
            error: hasError,
            style: { marginTop: '0px' },
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
    <Daily />
  </Fragment>
);

export default Monthly;
