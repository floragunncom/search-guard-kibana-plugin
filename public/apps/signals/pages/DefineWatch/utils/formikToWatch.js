import { cloneDeep, omit, get } from 'lodash';
import buildSchedule from './buildSchedule';
import { buildThrottle } from './buildThrottle';
import { buildGraphWatchChecks } from './graphWatch';
import {
  comboBoxOptionsToArray,
  foldMultiLineString,
} from '../../../utils/helpers';
import {
  WATCH_TYPES,
  META_FIELDS_TO_OMIT,
  SEVERITY
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

export function buildSeverity(watch) {
  const newWatch = cloneDeep(watch);

  if (!newWatch._ui.isSeverity) {
    delete newWatch.severity;

    newWatch.actions.forEach(action => {
      if (action.severity) {
        delete action.severity;
      }
    });

    return newWatch;
  }

  const { value, order, thresholds } = newWatch._ui.severity;

  const severity = {
    value: get(value, '[0].label', ''),
    order,
    mapping: []
  };

  // Order is important for ES plugin
  const thresholdLevels = [
    SEVERITY.INFO,
    SEVERITY.WARNING,
    SEVERITY.ERROR,
    SEVERITY.CRITICAL
  ];

  thresholdLevels.forEach(level => {
    if (thresholds[level]) {
      severity.mapping.push({
        level,
        threshold: thresholds[level]
      });
    }
  });

  newWatch.severity = severity;

  newWatch.actions.forEach(action => {
    action.severity = comboBoxOptionsToArray(action.severity);
  });

  // Have only search requests in graph mode to avoid conflict
  // with severity
  if (newWatch._ui.watchType === WATCH_TYPES.GRAPH) {
    newWatch.checks = newWatch.checks
      .filter(check => check.type.includes('search'));
  }

  return newWatch;
}

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

export const buildChecksFromChecksBlocks = (checks = []) => {
  try {
    return checks.reduce((res, { check }) => {
      res.push(JSON.parse(foldMultiLineString(check)));
      return res;
    }, []);
  } catch (err) {
    throw new Error('Invalid checks syntax!');
  }
};

export const buildChecks = ({ _ui: ui, checks = [] }) => {
  const { watchType, checksBlocks } = ui;

  if (watchType === WATCH_TYPES.JSON) {
    return JSON.parse(foldMultiLineString(checks));
  }

  // TODO: write tests for Blocks
  if (watchType === WATCH_TYPES.BLOCKS) {
    return buildChecksFromChecksBlocks(checksBlocks);
  }

  return buildGraphWatchChecks(ui);
};

export const formikToWatch = (formik = {}) => {
  let watch = cloneDeep(formik);
  delete watch._id;

  const checks = buildChecks(watch);
  watch = buildSeverity({ ...watch, checks });

  return {
    ...watch,
    ...buildSchedule(watch._ui),
    _ui: omit(watch._ui, META_FIELDS_TO_OMIT),
    actions: buildActions(watch.actions),
  };
};
