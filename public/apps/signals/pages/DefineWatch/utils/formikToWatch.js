import { forEach } from 'lodash';
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
  GRAPH_DEFAULTS
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
    account: comboBoxOptionsToArray(action.account)[0]
  };
}

export const buildThrottle = (watch = {}) => {
  const { _throttle_period, ...rest } = watch;
  return {
    ...rest,
    throttle_period: _throttle_period.interval + _throttle_period.unit
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
  let _action = buildThrottle(action);

  if (action.type === ACTION_TYPE.INDEX) {
    _action = buildIndexAction(_action);
  }

  if (action.type === ACTION_TYPE.EMAIL) {
    _action = buildEmailAction(_action);
  }

  if (action.type === ACTION_TYPE.SLACK) {
    _action = buildSlackAction(_action);
  }

  if (action.type === ACTION_TYPE.WEBHOOK) {
    _action = buildWebhookAction(_action);
  }

  return _action;
});

export const buildWhenAggregation = ({
  _aggregationType,
  _fieldName: [{ label: field } = {}],
}) => {
  if (_aggregationType === 'count' || !field) return {};
  return { when: { [_aggregationType]: { field } } };
};

export const buildGraphQuery = ({
  _bucketValue,
  _bucketUnitOfTime,
  _timeField,
  _aggregationType,
  _fieldName
}) => {
  const whenAggregation = buildWhenAggregation({ _aggregationType, _fieldName });
  const gte = `now-${Math.round(_bucketValue)}${_bucketUnitOfTime}`;
  const lte = 'now';

  return {
    size: 0,
    aggregations: whenAggregation,
    query: {
      bool: {
        filter: {
          range: {
            [_timeField]: { gte, lte },
          },
        },
      },
    },
  };
};

export const buildUiOverAggregation = ({
  _bucketValue,
  _bucketUnitOfTime,
  _timeField: field,
  _aggregationType,
  _fieldName
}) => {
  const interval = _bucketValue + _bucketUnitOfTime;
  const whenAggregation = buildWhenAggregation({ _aggregationType, _fieldName });
  const min = `now-${_bucketValue * BUCKET_COUNT}${_bucketUnitOfTime}`;
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
  _bucketValue,
  _bucketUnitOfTime,
  _timeField,
  _aggregationType,
  _fieldName
}) => {
  const overAggregation = buildUiOverAggregation({
    _bucketValue,
    _bucketUnitOfTime,
    _timeField,
    _aggregationType,
    _fieldName
  });

  // default range window to [BUCKET_COUNT] * the date histogram interval
  const gte = `now-${_bucketValue * BUCKET_COUNT}${_bucketUnitOfTime}`;
  const lte = 'now';

  return {
    size: 0,
    aggregations: overAggregation,
    query: {
      bool: {
        filter: {
          range: {
            [_timeField]: { gte, lte },
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
  _thresholdValue,
  _thresholdEnum,
  _aggregationType
}) => {
  const resultsPath = getResultsPath(_aggregationType);
  const operator = getOperator(_thresholdEnum);
  return getCondition(resultsPath, operator, _thresholdValue);
};

export const buildChecks = ({
  _bucketValue,
  _bucketUnitOfTime,
  _timeField,
  _aggregationType,
  _fieldName,
  _watchType,
  _index,
  _thresholdValue,
  _thresholdEnum,
  checks = []
}) => {
  if (_watchType !== WATCH_TYPE.GRAPH) return JSON.parse(checks);
  const indices = comboBoxOptionsToArray(_index);

  const body = buildGraphQuery({
    _bucketValue,
    _bucketUnitOfTime,
    _timeField,
    _aggregationType,
    _fieldName
  });

  const condition = buildCondition({
    _thresholdValue,
    _thresholdEnum,
    _aggregationType
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

export const buildWatch = (formik) => {
  const watch = {};
  const uiMetadata = { ...GRAPH_DEFAULTS };

  forEach(formik, (value, key) => {
    if (!META_FIELDS_TO_OMIT.includes(key)) {
      const isMetaFieldExcludingServerMeta = key[0] === '_' && key !== '_meta';
      if (isMetaFieldExcludingServerMeta) {
        uiMetadata[key] = value;
      } else {
        watch[key] = value;
      }
    }
  });

  watch.checks = buildChecks(formik);
  watch._ui = uiMetadata;
  return watch;
};

export const formikToWatch = (formik = {}) => {
  const watch = buildWatch(formik);
  const actions = buildActions(formik.actions);
  const schedule = buildSchedule(formik);
  return { ...watch, ...schedule, actions };
};
