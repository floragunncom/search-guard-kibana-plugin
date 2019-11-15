import React from 'react';
import { connect as connectFormik } from 'formik';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiStat,
  EuiSpacer,
} from '@elastic/eui';
import { SubHeader } from '../../../../../components';
import { get, isObject } from 'lodash';

const getValue = (response, path) => {
  const value = get(response, path);
  if (value === undefined) return '--';
  return value + '';
};

const QueryStat = ({ formik: { values: { _ui: { checksResult } } } }) => {
  const response = isObject(checksResult)
    ? Object.values(checksResult).filter(response => response._shards).pop()
    : {};

  return (
    <>
      <SubHeader title={<h4>Query stat</h4>} />
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiStat titleSize="xs" description="Took" title={`${getValue(response, 'took')} ms`} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat titleSize="xs" description="Total" title={getValue(response, 'hits.total.value')} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat titleSize="xs" description="Max score" title={getValue(response, 'hits.max_score')} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat titleSize="xs" description="Timed out" title={getValue(response, 'timed_out')} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default connectFormik(QueryStat);
