import React, { Fragment } from 'react';
import { connect as connectFormik } from 'formik';
import { EuiSpacer, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { Frequency, FrequencyPicker } from './Frequencies';
import Timezone from './Timezone';
import { SubHeader } from '../../../../components';
import { scheduleText } from '../../../../utils/i18n/watch';

const WatchSchedule = ({ formik: { values } }) => {
  return (
    <Fragment>
      <SubHeader title={<h4>{scheduleText}</h4>} />
      <EuiSpacer size="s" />
      <EuiFlexGroup className="sg-flex-group" justifyContent="spaceBetween">
        <EuiFlexItem className="sg-flex-item">
          <Frequency />
          <FrequencyPicker />
        </EuiFlexItem>
        <EuiFlexItem className="sg-flex-item">
          {values._frequency !== 'interval' && <Timezone />}
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};

export default connectFormik(WatchSchedule);
