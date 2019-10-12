import { forEach, cloneDeep, omit } from 'lodash';
import buildSchedule from './buildSchedule';
import { comboBoxOptionsToArray } from '../../../utils/helpers';
import {
  WATCH_TYPE,
  WATCH_CHECK_TYPE,
  WATCH_CHECK_SEARCH_NAME_DEFAULT,
  BUCKET_COUNT,
  HITS_TOTAL_RESULTS_PATH,
  AGGREGATION_RESULTS_PATH,
  META_FIELDS_TO_OMIT,
  WATCH_CHECK_CONDITION_NAME_DEFAULT,
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

export function buildWebhookAction(action = {}) {
  let headers = {};
  try {
    headers = JSON.parse(action.request.headers);
  } catch (error) {
    // do nothing
  }

  return {
    ...action,
    request: { ...action.request, headers }
  };
}

export function buildSlackAction(action = {}) {
  return {
    ...action,
    account: comboBoxOptionsToArray(action.account)[0]
  };
}

export function buildEmailAction(action = {}) {
  return {
    ...action,
    to: comboBoxOptionsToArray(action.to),
    cc: comboBoxOptionsToArray(action.cc),
    bcc: comboBoxOptionsToArray(action.bcc),
    account: comboBoxOptionsToArray(action.account)[0]
  };
}

export const buildThrottle = (watch = {}) => {
  const { throttle_period: { interval, unit }, ...rest } = watch;
  return {
    ...rest,
    throttle_period: interval + unit
  };
};

export const buildIndexAction = (action = {}) => {
  let checks = [];
  const index = comboBoxOptionsToArray(action.index)[0];

  try {
    checks = JSON.parse(action.checks || '[]');
  } catch (err) {
    console.error('Fail to parse index action checks');
  }

  return { ...action, index, checks };
};

export const buildActions = (actions = []) => actions.map(action => {
  const watchAction = buildThrottle(action);

  if (action.type === ACTION_TYPE.INDEX) {
    return buildIndexAction(watchAction);
  }

  if (action.type === ACTION_TYPE.EMAIL) {
    return buildEmailAction(watchAction);
  }

  if (action.type === ACTION_TYPE.SLACK) {
    return buildSlackAction(watchAction);
  }

  // if ACTION_TYPE.WEBHOOK
  return buildWebhookAction(watchAction);
});

export const buildWhenAggregation = ({
  aggregationType,
  fieldName: [{ label: field } = {}],
}) => {
  if (aggregationType === 'count' || !field) return {};
  return { when: { [aggregationType]: { field } } };
};

export const buildGraphQuery = ({
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName
}) => {
  const whenAggregation = buildWhenAggregation({ aggregationType, fieldName });
  const gte = `now-${Math.round(bucketValue)}${bucketUnitOfTime}`;
  const lte = 'now';

  return {
    size: 0,
    aggregations: whenAggregation,
    query: {
      bool: {
        filter: {
          range: {
            [timeField]: { gte, lte },
          },
        },
      },
    },
  };
};

export const buildUiOverAggregation = ({
  bucketValue,
  bucketUnitOfTime,
  timeField: field,
  aggregationType,
  fieldName
}) => {
  const interval = bucketValue + bucketUnitOfTime;
  const whenAggregation = buildWhenAggregation({ aggregationType, fieldName });
  const min = `now-${bucketValue * BUCKET_COUNT}${bucketUnitOfTime}`;
  const max = 'now';

  return {
    over: {
      date_histogram: {
        field,
        interval,
        // time_zone: moment.tz.guess(), // TODO: uncomment when timezone is supported
        min_doc_count: 0,
        extended_bounds: { min, max }
      },
      aggregations: whenAggregation
    }
  };
};

export const buildUiGraphQuery = ({
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName
}) => {
  const overAggregation = buildUiOverAggregation({
    bucketValue,
    bucketUnitOfTime,
    timeField,
    aggregationType,
    fieldName
  });

  // default range window to [BUCKET_COUNT] * the date histogram interval
  const gte = `now-${bucketValue * BUCKET_COUNT}${bucketUnitOfTime}`;
  const lte = 'now';

  return {
    size: 0,
    aggregations: overAggregation,
    query: {
      bool: {
        filter: {
          range: {
            [timeField]: { gte, lte },
          },
        },
      },
    },
  };
};

export const getCondition = (resultsPath, operator, value) => ({
  type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
  name: WATCH_CHECK_CONDITION_NAME_DEFAULT,
  source: `${resultsPath} ${operator} ${value}`
});

export const getResultsPath = (aggregationType) => {
  if (aggregationType === 'count') return HITS_TOTAL_RESULTS_PATH;
  return AGGREGATION_RESULTS_PATH;
};

export const getOperator = thresholdEnum =>
  ({ ABOVE: '>', BELOW: '<', EXACTLY: '==' }[thresholdEnum]);

export const buildCondition = ({
  thresholdValue,
  thresholdEnum,
  aggregationType
}) => {
  const resultsPath = getResultsPath(aggregationType);
  const operator = getOperator(thresholdEnum);
  return getCondition(resultsPath, operator, thresholdValue);
};

export const buildChecksFromChecksBlocks = (checks = []) => {
  try {
    return checks.reduce((res, { check }) => {
      res.push(JSON.parse(check));
      return res;
    }, []);
  } catch (err) {
    throw new Error('Invalid checks syntax!');
  }
};

export const buildChecks = ({
  _ui: {
    bucketValue,
    bucketUnitOfTime,
    timeField,
    aggregationType,
    fieldName,
    watchType,
    index,
    thresholdValue,
    thresholdEnum,
    checksBlocks,
  },
  checks = [],
}) => {
  if (watchType === WATCH_TYPE.JSON) return JSON.parse(checks);
  // TODO: write tests for Blocks
  if (watchType === WATCH_TYPE.BLOCKS) return buildChecksFromChecksBlocks(checksBlocks);

  // Graph watch checks
  const indices = comboBoxOptionsToArray(index);

  const body = buildGraphQuery({
    bucketValue,
    bucketUnitOfTime,
    timeField,
    aggregationType,
    fieldName
  });

  const condition = buildCondition({
    thresholdValue,
    thresholdEnum,
    aggregationType
  });

  return [
    {
      type: WATCH_CHECK_TYPE.SEARCH,
      name: WATCH_CHECK_SEARCH_NAME_DEFAULT,
      target: WATCH_CHECK_SEARCH_NAME_DEFAULT,
      request: { indices, body }
    },
    condition
  ];
};

export const formikToWatch = (formik = {}) => {
  const watch = cloneDeep(formik);
  delete watch._id;

  return {
    ...watch,
    ...buildSchedule(watch._ui),
    _ui: omit(watch._ui, META_FIELDS_TO_OMIT),
    checks: buildChecks(formik),
    actions: buildActions(formik.actions),
  };
};
