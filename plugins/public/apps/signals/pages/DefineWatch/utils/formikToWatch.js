/* eslint-disable @kbn/eslint/require-license-header */
import { cloneDeep, omit, get } from 'lodash';
import buildSchedule from './buildSchedule';
import { buildThrottle } from './buildThrottle';
import { buildGraphWatchChecks } from './graphWatch';
import { buildCheckBlock } from '../components/BlocksWatch/utils/checkBlocks';
import { comboBoxOptionsToArray, foldMultiLineString } from '../../../utils/helpers';
import { WATCH_TYPES, META_FIELDS_TO_OMIT, SEVERITY } from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

export function buildSeverity(watch) {
  const newWatch = cloneDeep(watch);

  if (!newWatch._ui.isResolveActions) {
    delete newWatch.resolve_actions;
  }

  if (!newWatch._ui.isSeverity) {
    delete newWatch.severity;

    newWatch.actions.forEach((action) => {
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
    mapping: [],
  };

  // Order is important for ES plugin
  const thresholdLevels = [SEVERITY.INFO, SEVERITY.WARNING, SEVERITY.ERROR, SEVERITY.CRITICAL];

  thresholdLevels.forEach((level) => {
    if (thresholds[level]) {
      severity.mapping.push({
        level,
        threshold: thresholds[level],
      });
    }
  });

  newWatch.severity = severity;

  newWatch.actions.forEach((action) => {
    action.severity = comboBoxOptionsToArray(action.severity);
  });

  // Have only search requests in graph mode to avoid conflict
  // with severity
  if (newWatch._ui.watchType === WATCH_TYPES.GRAPH) {
    newWatch.checks = newWatch.checks.filter((check) => check.type.includes('search'));
  }

  if (newWatch._ui.isResolveActions) {
    newWatch.resolve_actions.forEach((action) => {
      action.resolves_severity = comboBoxOptionsToArray(action.resolves_severity);
    });
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
    request: { ...action.request, headers },
  };
}

export function buildSlackAction(action = {}) {
  return {
    ...action,
    account: comboBoxOptionsToArray(action.account)[0],
  };
}

export function buildJiraAction(action = {}) {
  const newAction = {
    ...action,
    account: comboBoxOptionsToArray(action.account)[0],
  };

  Object.keys(newAction.issue).forEach((key) => {
    if (!newAction.issue[key]) {
      delete newAction.issue[key];
    }
  });

  return newAction;
}

export function buildPagerdutyAction(action = {}) {
  const newAction = {
    ...action,
    account: comboBoxOptionsToArray(action.account)[0],
  };

  Object.keys(action.event).forEach((key) => {
    if (!action.event[key]) {
      delete action.event[key];
    }
  });

  Object.keys(action.event.payload).forEach((key) => {
    if (!action.event.payload[key]) {
      delete action.event.payload[key];
    }
  });

  return newAction;
}

export function buildEmailAction(action = {}) {
  return {
    ...action,
    to: comboBoxOptionsToArray(action.to),
    cc: comboBoxOptionsToArray(action.cc),
    bcc: comboBoxOptionsToArray(action.bcc),
    account: comboBoxOptionsToArray(action.account)[0],
  };
}

export const buildIndexAction = (action = {}) => {
  return {
    ...action,
    index: get(action, 'index[0].label', ''),
  };
};

export const buildChecksFromChecksBlocks = (checks = []) => checks.map(buildCheckBlock);

export const buildChecksFromFormikChecks = (checks = []) => JSON.parse(foldMultiLineString(checks));

export const buildChecks = ({ _ui: ui = {}, checks = [] }) => {
  const { watchType, checksBlocks } = ui;

  if (watchType === WATCH_TYPES.JSON) {
    try {
      return buildChecksFromFormikChecks(checks);
    } catch (err) {
      console.error('Fail to parse checks for Json watch');
      return [];
    }
  }

  if (watchType === WATCH_TYPES.BLOCKS) {
    try {
      return buildChecksFromChecksBlocks(checksBlocks);
    } catch (err) {
      console.error('Fail to parse checks for Blocks watch');
      return [];
    }
  }

  return buildGraphWatchChecks(ui);
};

export const buildActions = ({ actions = [], resolve_actions: resolveActions, _ui = {} }) => {
  const buildHelper = (actions) => {
    const newActions = cloneDeep(actions);

    return newActions.map((action) => {
      // resolve_actions don't have throttle_period
      // TODO: add test for the absence of resolve_actions throttle_period
      const watchAction = action.resolves_severity ? action : buildThrottle(action);

      try {
        if (_ui.watchType === WATCH_TYPES.GRAPH && action.type !== ACTION_TYPE.INDEX) {
          // Graph watch actions has no checks. Except the index (Elasticsearch) action.
          watchAction.checks = [];
        } else if (_ui.watchType === WATCH_TYPES.JSON) {
          watchAction.checks = buildChecksFromFormikChecks(watchAction.checks);
        } else if (_ui.watchType === WATCH_TYPES.BLOCKS) {
          watchAction.checks = buildChecksFromChecksBlocks(watchAction.checksBlocks);
        }
      } catch (err) {
        console.error(`Fail to parse action "${action.name}" checks`);
        watchAction.checks = [];
      }

      delete watchAction.checksBlocks;

      if (action.type === ACTION_TYPE.INDEX) {
        return buildIndexAction(watchAction);
      }

      if (action.type === ACTION_TYPE.EMAIL) {
        return buildEmailAction(watchAction);
      }

      if (action.type === ACTION_TYPE.SLACK) {
        return buildSlackAction(watchAction);
      }

      if (action.type === ACTION_TYPE.JIRA) {
        return buildJiraAction(watchAction);
      }

      if (action.type === ACTION_TYPE.PAGERDUTY) {
        return buildPagerdutyAction(watchAction);
      }

      // if ACTION_TYPE.WEBHOOK
      return buildWebhookAction(watchAction);
    });
  };

  const result = { actions: buildHelper(actions) };

  if (resolveActions) {
    result.resolve_actions = buildHelper(resolveActions);
  }

  return result;
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
    ...buildActions(watch),
  };
};
