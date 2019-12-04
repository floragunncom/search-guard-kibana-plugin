import { cloneDeep, isEmpty } from 'lodash';
import {
  stringifyPretty,
  arrayToComboBoxOptions,
  unfoldMultiLineString,
} from '../../../utils/helpers';
import buildFormikSchedule from './buildFormikSchedule';
import { buildFormikThrottle } from './buildFormikThrottle';
import {
  GRAPH_DEFAULTS,
  WATCH_TYPES,
  DEFAULT_WATCH,
  RESULT_FIELD_DEFAULTS,
  SEVERITY_META_DEFAULTS,
  SEVERITY_ORDER,
  SEVERITY,
  SEVERITY_COLORS
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

export function buildFormikSeverity(watch = {}) {
  const newWatch = cloneDeep(watch);

  if (!newWatch.severity) {
    newWatch._ui = { ...newWatch._ui, ...SEVERITY_META_DEFAULTS };
    newWatch.actions.forEach(action => {
      action.severity = [];
    });
    return newWatch;
  }

  const { severity: { value = '', order = SEVERITY_ORDER.ASCENDING } = {} } = newWatch;

  const severity = {
    value: [{ label: value }],
    order,
    thresholds: {
      [SEVERITY.INFO]: undefined,
      [SEVERITY.WARNING]: undefined,
      [SEVERITY.ERROR]: undefined,
      [SEVERITY.CRITICAL]: undefined
    }
  };

  newWatch.severity.mapping.forEach(mapping => {
    severity.thresholds[mapping.level.toLowerCase()] = mapping.threshold;
  });

  newWatch._ui = { ...newWatch._ui, severity, isSeverity: true };

  newWatch.actions.forEach(action => {
    action.severity = action.severity.map(label => ({
      label,
      color: SEVERITY_COLORS[label]
    }));
  });

  return newWatch;
}

export function buildFormikWebhookAction(action = {}) {
  return {
    ...action,
    request: {
      ...action.request,
      headers: stringifyPretty(action.request.headers)
    }
  };
}

export function buildFormikSlackAction(action = {}) {
  return {
    ...action,
    account: arrayToComboBoxOptions([action.account])
  };
}

export function buildFormikEmailAction(action = {}) {
  return {
    ...action,
    to: arrayToComboBoxOptions(action.to),
    cc: arrayToComboBoxOptions(action.cc),
    bcc: arrayToComboBoxOptions(action.bcc),
    account: arrayToComboBoxOptions([action.account])
  };
}

export const buildFormikChecksBlocks = (checks = []) =>
  checks.map((check, index) => ({
    response: '',
    check: unfoldMultiLineString(stringifyPretty(check)),
    index,
  }));

export const buildFormikChecks = (checks = []) => unfoldMultiLineString(stringifyPretty(checks));

export const buildFormikMeta = ({ _ui = {}, checks = [], trigger } = {}) => {
  const ui = {
    ...cloneDeep(GRAPH_DEFAULTS),
    ...RESULT_FIELD_DEFAULTS,
    checksBlocks: buildFormikChecksBlocks(checks),
    ...buildFormikSchedule({ trigger }),
    ..._ui
  };

  return !isEmpty(_ui) ? ui : Object.assign(ui, { watchType: WATCH_TYPES.JSON });
};

export const buildFormikIndexAction = (action = {}) => ({
  ...action,
  index: [{ label: action.index }],
  checks: stringifyPretty(action.checks || [])
});

export const buildFormikActions = (actions = []) => actions.map(action => {
  if (action.type === ACTION_TYPE.INDEX) {
    return buildFormikThrottle(buildFormikIndexAction(action));
  }

  if (action.type === ACTION_TYPE.EMAIL) {
    return buildFormikThrottle(buildFormikEmailAction(action));
  }

  if (action.type === ACTION_TYPE.SLACK) {
    return buildFormikThrottle(buildFormikSlackAction(action));
  }

  if (action.type === ACTION_TYPE.WEBHOOK) {
    return buildFormikThrottle(buildFormikWebhookAction(action));
  }

  return buildFormikThrottle(action);
});

export const watchToFormik = (watch = {}) => {
  const formik = {
    ...cloneDeep(DEFAULT_WATCH),
    ...cloneDeep(watch)
  };

  const uiMeta = buildFormikMeta(watch);
  const { actions, _ui, ...rest } = buildFormikSeverity({ ...formik, _ui: uiMeta });

  return {
    ...rest,
    _ui,
    checks: buildFormikChecks(formik.checks),
    actions: buildFormikActions(actions)
  };
};
