import React from 'react';
import { get } from 'lodash';
import { connect as connectFormik } from 'formik';
import { EuiFlexGroup, EuiFlexItem, EuiStat, EuiSpacer, EuiErrorBoundary } from '@elastic/eui';
import { SubHeader } from '../../../../../components';

const getValue = (response, path) => {
  const value = get(response, path);
  if (value === undefined) return '--';
  return value + '';
};

const QueryStat = ({ formik: { values } }) => {
  const checksResult = get(values, '_ui.checksResult', {}) || {};
  const response = Object.values(checksResult).filter((value) => value._shards)[0];
  if (!response) return null;

  return (
    <EuiErrorBoundary>
      <SubHeader title={<h4>Query stat</h4>} />
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiStat titleSize="xs" description="Took" title={`${getValue(response, 'took')} ms`} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            titleSize="xs"
            description="Total"
            title={getValue(response, 'hits.total.value')}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            titleSize="xs"
            description="Max score"
            title={getValue(response, 'hits.max_score')}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat titleSize="xs" description="Timed out" title={getValue(response, 'timed_out')} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiErrorBoundary>
  );
};

export default connectFormik(QueryStat);
