import { cloneDeep, isEmpty, get } from 'lodash';
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

export const buildFormikChecks = (checks = []) => unfoldMultiLineString(stringifyPretty(checks));

export function buildFormikSeverity(watch = {}) {
  const newWatch = cloneDeep(watch);

  if (!newWatch.severity) {
    newWatch._ui = { ...newWatch._ui, ...SEVERITY_META_DEFAULTS };
    newWatch.resolve_actions = [];
    newWatch.actions.forEach(action => {
      action.severity = [];
    });
    return newWatch;
  }

  const { severity: { value = '', order = SEVERITY_ORDER.ASCENDING } = {} } = newWatch;

  const severity = {
    value: [{ label: value }],
    order: order.toLowerCase(),
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

  if (isEmpty(newWatch.resolve_actions)) {
    newWatch._ui.isResolveActions = false;
    newWatch.resolve_actions = [];
  } else {
    newWatch._ui.isResolveActions = true;
  }

  newWatch.resolve_actions.forEach(action => {
    action.resolves_severity = action.resolves_severity.map(label => ({
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

export function buildFormikJiraAction(action = {}) {
  return {
    ...action,
    account: arrayToComboBoxOptions([action.account]),
  };
}

export function buildFormikPagerdutyAction(action = {}) {
  return {
    ...action,
    account: arrayToComboBoxOptions([action.account]),
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
  checks.map(({ type = '', name = '', target = '', ...rest }, idx) => {
    const result = {
      type,
      name,
      target,
      id: idx,
      response: '',
      ...rest,
    };

    switch (type) {
      case 'static':
        result.valueForCodeEditor = stringifyPretty(rest.value);
        break;
      case 'search':
        result.valueForCodeEditor = stringifyPretty(get(rest, 'request.body', {}));
        result.request.indices = arrayToComboBoxOptions(result.request.indices);
        break;
      // TODO: add more cases
      default:
        break;
    }

    return result;
  });

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
  // checks: stringifyPretty(action.checks || [])
});

export const buildFormikActions = ({
  actions = [],
  resolve_actions: resolveActions = [],
  _ui = {}
}) => {
  const buildHelper = actions => {
    const newActions = cloneDeep(actions);
    return newActions.map(action => {
      // resolve_actions don't have throttle_period
      // TODO: add tests for this
      const newAction = action.resolves_severity ? action : buildFormikThrottle(action);

      if (!newAction.checks) {
        newAction.checks = [];
      }

      newAction.checks = stringifyPretty(newAction.checks);

      if (newAction.type === ACTION_TYPE.INDEX) {
        return buildFormikIndexAction(newAction);
      }

      if (newAction.type === ACTION_TYPE.EMAIL) {
        return buildFormikEmailAction(newAction);
      }

      if (newAction.type === ACTION_TYPE.SLACK) {
        return buildFormikSlackAction(newAction);
      }

      if (newAction.type === ACTION_TYPE.WEBHOOK) {
        return buildFormikWebhookAction(newAction);
      }

      if (newAction.type === ACTION_TYPE.JIRA) {
        return buildFormikJiraAction(newAction);
      }

      if (newAction.type === ACTION_TYPE.PAGERDUTY) {
        return buildFormikPagerdutyAction(newAction);
      }

      return newAction;
    });
  };

  return {
    actions: buildHelper(actions),
    resolve_actions: buildHelper(resolveActions)
  };
};

export const watchToFormik = (watch = {}) => {
  const formik = {
    ...cloneDeep(DEFAULT_WATCH),
    ...cloneDeep(watch)
  };

  const uiMeta = buildFormikMeta(watch);
  const {
    actions,
    resolve_actions: resolveActions,
    _ui,
    ...rest
  } = buildFormikSeverity({ ...formik, _ui: uiMeta });

  return {
    ...rest,
    _ui,
    checks: buildFormikChecks(formik.checks),
    ...buildFormikActions({ actions, resolve_actions: resolveActions, _ui })
  };
};
