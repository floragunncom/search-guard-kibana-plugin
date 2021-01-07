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
import PropTypes from 'prop-types';
import { EuiSpacer } from '@elastic/eui';
import Interval from '../../WatchSchedule/Frequencies/Interval';
import { LabelAppendLink } from '../../../../../../components';
import {
  isInvalid,
  hasError,
  validateInterval,
  validateThrottleAdvancedInterval,
} from '../../../utils/validate';
import { throttlePeriodText, watchActionThrottleHelpText } from '../../../../../utils/i18n/watch';
import { DOC_LINKS } from '../../../../../utils/constants';

const ActionThrottlePeriod = ({ index }) => (
  <>
    <Interval
      helpText={watchActionThrottleHelpText}
      propsInterval={{
        name: `actions[${index}].throttle_period.interval`,
        rowProps: {
          label: throttlePeriodText,
          isInvalid,
          error: hasError,
        },
        formikFieldProps: {
          validate: validateInterval,
        },
      }}
      propsAdvInterval={{
        name: `actions[${index}].throttle_period.advInterval`,
        rowProps: {
          label: throttlePeriodText,
          labelAppend: <LabelAppendLink href={DOC_LINKS.TRIGGERS.SCHEDULE} name="ScheduleDoc" />,
          isInvalid,
          error: hasError,
        },
        formikFieldProps: {
          validate: validateThrottleAdvancedInterval,
        },
      }}
      propsUnit={{
        name: `actions[${index}].throttle_period.unit`,
        rowProps: {
          hasEmptyLabelSpace: true,
        },
      }}
    />
    <EuiSpacer size="m" />
  </>
);

ActionThrottlePeriod.propTypes = {
  index: PropTypes.number.isRequired,
};

export default ActionThrottlePeriod;
