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

import React from 'react';
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';

import { FormikFieldNumber, FormikSelect } from '../../../../../../components';
import { isInvalid, hasError, validateInterval } from '../../../../../../utils/validate';
import { everyText } from '../../../../../../utils/i18n/watch';
import { UNITOPTIONS } from './utils/constants';

const Interval = () => (
  <EuiFlexGroup
    alignItems="flexStart"
    style={{ paddingLeft: '10px', marginTop: '5px' }}
    gutterSize="none"
  >
    <EuiFlexItem style={{ margin: '0px 10px 0px 0px' }}>
      <FormikFieldNumber
        name="_period.interval"
        formRow
        formikFieldProps={{ validate: validateInterval }}
        rowProps={{
          label: everyText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{ icon: 'clock' }}
      />
    </EuiFlexItem>
    <EuiFlexItem style={{ marginTop: '2px' }}>
      <FormikSelect
        name="_period.unit"
        formRow
        rowProps={{
          hasEmptyLabelSpace: true
        }}
        elementProps={{ options: UNITOPTIONS }}
      />
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default Interval;
