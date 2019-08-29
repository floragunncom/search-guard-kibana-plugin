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
      <SubHeader
        title={<h4>{scheduleText}</h4>}
      />
      <EuiSpacer size="s" />
      <div style={{ maxWidth: '1200px' }}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <div style={{ maxWidth: '400px' }}>
              <Frequency />
              <FrequencyPicker />
            </div>
          </EuiFlexItem>
          {values._frequency !== 'interval' && (
            <EuiFlexItem>
              <Timezone />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </div>
    </Fragment>
  );
};

export default connectFormik(WatchSchedule);
