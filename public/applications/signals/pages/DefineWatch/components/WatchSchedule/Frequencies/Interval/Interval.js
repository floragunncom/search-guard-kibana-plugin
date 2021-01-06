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
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { EuiFlexItem, EuiFlexGroup, EuiSpacer } from '@elastic/eui';
import {
  FormikFieldNumber,
  FormikSelect,
  FormikFieldText,
  LabelAppendLink,
} from '../../../../../../components';
import {
  isInvalid,
  hasError,
  validateInterval,
  validateAdvancedInterval,
} from '../../../../utils/validate';
import { TIME_INTERVAL_OPTIONS, ADVANCED_TIME_PERIOD_UNIT } from '../../../../utils/constants';
import { DOC_LINKS } from '../../../../../../utils/constants';
import { everyText } from '../../../../../../utils/i18n/watch';

const Interval = ({ propsInterval, propsAdvInterval, propsUnit, formik: { values } }) => {
  const unit = get(values, propsUnit.name);
  const isAdvanced = unit === ADVANCED_TIME_PERIOD_UNIT;

  return (
    <Fragment>
      <EuiSpacer size="m" />
      <EuiFlexGroup alignItems="flexStart" style={{ maxWidth: '425px' }}>
        <EuiFlexItem>
          {!isAdvanced ? (
            <FormikFieldNumber formRow elementProps={{ icon: 'clock' }} {...propsInterval} />
          ) : (
            <FormikFieldText
              formRow
              formikFieldProps={{ validate: validateInterval }}
              elementProps={{ icon: 'clock' }}
              {...propsAdvInterval}
            />
          )}
        </EuiFlexItem>
        <EuiFlexItem style={{ marginTop: '8px' }}>
          <FormikSelect
            formRow
            rowProps={{ hasEmptyLabelSpace: true }}
            elementProps={{ options: TIME_INTERVAL_OPTIONS }}
            {...propsUnit}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};

Interval.propTypes = {
  propsInterval: PropTypes.shape({
    name: PropTypes.string.isRequired,
    rowProps: PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
      isInvalid: PropTypes.func.isRequired,
      error: PropTypes.func.isRequired,
    }).isRequired,
    formikFieldProps: PropTypes.shape({
      validate: PropTypes.func.isRequired,
    }).isRequired,
  }),
  propsAdvInterval: PropTypes.shape({
    name: PropTypes.string.isRequired,
    rowProps: PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
      labelAppend: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
      isInvalid: PropTypes.func.isRequired,
      error: PropTypes.func.isRequired,
    }),
    formikFieldProps: PropTypes.shape({
      validate: PropTypes.func.isRequired,
    }).isRequired,
  }),
  propsUnit: PropTypes.shape({
    name: PropTypes.string.isRequired,
    rowProps: PropTypes.shape({
      hasEmptyLabelSpace: PropTypes.bool,
    }),
  }),
};

Interval.defaultProps = {
  propsInterval: {
    name: '_ui.period.interval',
    rowProps: {
      label: everyText,
      isInvalid,
      error: hasError,
    },
    formikFieldProps: {
      validate: validateInterval,
    },
  },
  propsAdvInterval: {
    name: '_ui.period.advInterval',
    rowProps: {
      label: everyText,
      labelAppend: <LabelAppendLink href={DOC_LINKS.TRIGGERS.SCHEDULE} name="ScheduleDoc" />,
      isInvalid,
      error: hasError,
    },
    formikFieldProps: {
      validate: validateAdvancedInterval,
    },
  },
  propsUnit: {
    name: '_ui.period.unit',
    rowProps: {
      hasEmptyLabelSpace: true,
    },
  },
  formik: PropTypes.object.isRequired,
};

export default connectFormik(Interval);
