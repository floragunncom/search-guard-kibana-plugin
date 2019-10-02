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
      <EuiFlexItem style={{ margin: '0 .625em 0 0' }}>
        <FormikFieldNumber
          name={`actions[${index}]._throttle_period.interval`}
          formRow
          formikFieldProps={{ validate: validateInterval }}
          rowProps={{
            label: throttlePeriodText,
            isInvalid,
            error: hasError,
            style: { paddingBottom: '0' },
          }}
          elementProps={{ icon: 'clock' }}
        />
      </EuiFlexItem>
      <EuiFlexItem style={{ margin: '.125em' }}>
        <FormikSelect
          name={`actions[${index}]._throttle_period.unit`}
          formRow
          rowProps={{
            hasEmptyLabelSpace: true,
            style: { paddingBottom: '0' },
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
