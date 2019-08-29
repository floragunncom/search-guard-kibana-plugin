import React from 'react';
import PropTypes from 'prop-types';
import { EuiFlexItem, EuiFlexGroup, EuiFormRow } from '@elastic/eui';
import { FormikFieldNumber, FormikSelect } from '../../../../../components';
import { isInvalid, hasError, validateInterval } from '../../../../../utils/validate';
import { throttlePeriodText } from '../../../../../utils/i18n/common';
import { UNITOPTIONS } from './utils/constants';

const ActionThrottlePeriod = ({ index }) => (
  <EuiFormRow>
    <EuiFlexGroup
      alignItems="flexStart"
      gutterSize="none"
    >
      <EuiFlexItem style={{ margin: '0px 10px 0px 0px' }}>
        <FormikFieldNumber
          name={`actions[${index}]._throttle_period.interval`}
          formRow
          formikFieldProps={{ validate: validateInterval }}
          rowProps={{
            label: throttlePeriodText,
            isInvalid,
            error: hasError,
          }}
          elementProps={{ icon: 'clock' }}
        />
      </EuiFlexItem>
      <EuiFlexItem style={{ margin: '2px' }}>
        <FormikSelect
          name={`actions[${index}]._throttle_period.unit`}
          formRow
          rowProps={{
            hasEmptyLabelSpace: true
          }}
          elementProps={{ options: UNITOPTIONS }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiFormRow>
);

ActionThrottlePeriod.propTypes = {
  index: PropTypes.number.isRequired
};

export default ActionThrottlePeriod;
