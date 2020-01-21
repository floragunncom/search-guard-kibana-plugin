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
import { throttlePeriodText } from '../../../../../utils/i18n/watch';
import { DOC_LINKS } from '../../../../../utils/constants';

const ActionThrottlePeriod = ({ index }) => (
  <>
    <Interval
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
