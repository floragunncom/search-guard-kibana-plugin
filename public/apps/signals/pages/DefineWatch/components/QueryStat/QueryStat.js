/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import { EuiFlexGroup, EuiFlexItem, EuiStat, EuiSpacer, EuiErrorBoundary } from '@elastic/eui';
import { SubHeader } from '../../../../../components';
import { WATCH_TYPES, CHECK_MYSEARCH } from '../../utils/constants';
import {
  tookText,
  maxScoreText,
  timedOutText,
  totalText,
  checksStatText,
  queryStatText,
} from '../../../../utils/i18n/watch';

const NO_VALUE_PLACEHOLDER = '--';

const getValue = (response, path) => {
  const value = get(response, path);
  if (value === undefined) return NO_VALUE_PLACEHOLDER;
  return value + '';
};

function calcExecutionTime({ executionEnd, executionStart }) {
  if (!executionEnd || !executionStart) return NO_VALUE_PLACEHOLDER;
  return Math.abs(new Date(executionEnd) - new Date(executionStart));
}

function ChecksStat({ executionTime }) {
  return (
    <>
      <SubHeader title={<h4>{checksStatText}</h4>} />
      <EuiSpacer size="m" />
      <EuiFlexItem>
        <EuiStat titleSize="xs" description={tookText} title={`${executionTime} ms`} />
      </EuiFlexItem>
    </>
  );
}

function GraphChecksStat({ checksResult, executionTime }) {
  return (
    <>
      <SubHeader title={<h4>{queryStatText}</h4>} />
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiStat
            titleSize="xs"
            description={tookText}
            title={`${getValue(checksResult, 'took')} ms`}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            titleSize="xs"
            description={totalText}
            title={getValue(checksResult, 'hits.total.value')}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            titleSize="xs"
            description={maxScoreText}
            title={getValue(checksResult, 'hits.max_score')}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            titleSize="xs"
            description={timedOutText}
            title={getValue(checksResult, 'timed_out')}
          />
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="m" />
      <ChecksStat executionTime={executionTime} />
    </>
  );
}

const QueryStat = ({ formik: { values } }) => {
  const watchType = get(values, '_ui.watchType');
  const checksResult = get(values, '_ui.checksResult', {});
  if (!checksResult) return null;

  const executionTime = calcExecutionTime({
    executionEnd: checksResult.execution_end,
    executionStart: checksResult.execution_start,
  });

  let Stats;
  if (watchType === WATCH_TYPES.GRAPH) {
    const queryResult = get(checksResult, `runtime_attributes.data.${CHECK_MYSEARCH}`, null);
    Stats = <GraphChecksStat queryResult={queryResult} executionTime={executionTime} />;
  } else {
    Stats = <ChecksStat executionTime={executionTime} />;
  }

  return (
    <>
      <EuiSpacer />
      <EuiErrorBoundary>{Stats}</EuiErrorBoundary>
    </>
  );
};

export default connectFormik(QueryStat);
