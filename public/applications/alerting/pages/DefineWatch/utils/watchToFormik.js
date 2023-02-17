/* eslint-disable @osd/eslint/require-license-header */
import { cloneDeep, isEmpty, defaultsDeep } from 'lodash';
import {
  stringifyPretty,
  arrayToComboBoxOptions,
  unfoldMultiLineString,
} from '../../../utils/helpers';
import buildFormikSchedule from './buildFormikSchedule';
import { buildFormikThrottle } from './buildFormikThrottle';
import { buildFormikCheckBlock } from '../components/BlocksWatch/utils/checkBlocks';
import {
  GRAPH_DEFAULTS,
  DEFAULT_WATCH,
  RESULT_FIELD_DEFAULTS,
  SEVERITY_META_DEFAULTS,
  SEVERITY_ORDER,
  SEVERITY,
  SEVERITY_COLORS,
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';
import {
  email as EMAIL_DEFAULTS,
  pagerduty as PAGERDUTY_DEFAULTS,
  jira as JIRA_DEFAULTS,
  slack as SLACK_DEFAULTS,
  webhook as WEBHOOK_DEFAULTS,
} from '../../DefineWatch/components/ActionPanel/utils/action_defaults';

export function buildFormikSeverity(watch = {}) {
  const newWatch = cloneDeep(watch);

  if (!newWatch.severity) {
    newWatch._ui = { ...newWatch._ui, ...SEVERITY_META_DEFAULTS };
    newWatch.resolve_actions = [];
    newWatch.actions.forEach((action) => {
      action.severity = [];
    });

    return newWatch;
  }

  const { severity: { value, order = SEVERITY_ORDER.ASCENDING } = {} } = newWatch;

  const severity = {
    value: [{ label: value }],
    valueString: value,
    order: order.toLowerCase(),
    thresholds: {
      [SEVERITY.INFO]: undefined,
      [SEVERITY.WARNING]: undefined,
      [SEVERITY.ERROR]: undefined,
      [SEVERITY.CRITICAL]: undefined,
    },
  };


  newWatch.severity.mapping.forEach((mapping) => {
    severity.thresholds[mapping.level.toLowerCase()] = Number.isInteger(mapping.threshold)
      ? mapping.threshold
      : undefined;
  });

  newWatch._ui = { ...newWatch._ui, severity, isSeverity: true };

  newWatch.actions.forEach((action) => {
    action.severity = action.severity.map((label) => ({
      label,
      color: SEVERITY_COLORS[label],
    }));
  });

  if (isEmpty(newWatch.resolve_actions)) {
    newWatch._ui.isResolveActions = false;
    newWatch.resolve_actions = [];
  } else {
    newWatch._ui.isResolveActions = true;
  }

  newWatch.resolve_actions.forEach((action) => {
    action.resolves_severity = action.resolves_severity.map((label) => ({
      label,
      color: SEVERITY_COLORS[label],
    }));
  });

  return newWatch;
}

function buildFormikResolveAction(action) {
  // Resolve_actions don't have throttle_period
  if (action.resolves_severity) {
    delete action.severity;
    delete action.throttle_period;
  }
  return action;
}

export function buildFormikWebhookAction(action = {}) {
  const newAction = defaultsDeep(action, WEBHOOK_DEFAULTS);

  return buildFormikResolveAction({
    ...newAction,
    request: {
      ...newAction.request,
      headers: stringifyPretty(action.request.headers),
    },
  });
}

export function buildFormikSlackAction(action = {}) {
  return buildFormikResolveAction({
    ...defaultsDeep(action, SLACK_DEFAULTS),
    account: arrayToComboBoxOptions([action.account]),
  });
}

export function buildFormikJiraAction(action = {}) {
  return buildFormikResolveAction({
    ...defaultsDeep(action, JIRA_DEFAULTS),
    account: arrayToComboBoxOptions([action.account]),
  });
}

export function buildFormikPagerdutyAction(action = {}) {
  return buildFormikResolveAction({
    ...defaultsDeep(action, PAGERDUTY_DEFAULTS),
    account: arrayToComboBoxOptions([action.account]),
  });
}

export function buildFormikEmailAction(action = {}) {
  return buildFormikResolveAction({
    ...defaultsDeep(action, EMAIL_DEFAULTS),
    to: arrayToComboBoxOptions(action.to),
    cc: arrayToComboBoxOptions(action.cc),
    bcc: arrayToComboBoxOptions(action.bcc),
    account: arrayToComboBoxOptions([action.account]),
  });
}

export const buildFormikChecks = (checks = []) => unfoldMultiLineString(stringifyPretty(checks));

export function buildFormikChecksBlocks(checks = []) {
  return checks.map(buildFormikCheckBlock);
}

export const buildFormikMeta = ({ _ui = {}, checks = [], trigger } = {}) => {
  return {
    ...cloneDeep(GRAPH_DEFAULTS),
    ...RESULT_FIELD_DEFAULTS,
    checksBlocks: buildFormikChecksBlocks(checks),
    ...buildFormikSchedule({ trigger }),
    ..._ui,
  };
};

export const buildFormikIndexAction = (action = {}) => ({
  ...action,
  index: [{ label: action.index }],
});

export const buildFormikActions = ({ actions = [], resolve_actions: resolveActions = [] }) => {
  const buildHelper = (watchActions = []) => {
    const actions = cloneDeep(watchActions);

    return actions.map((action) => {
      action = buildFormikThrottle(action);

      if (!action.checks) {
        action.checks = [];
      }

      const checks = buildFormikChecks(action.checks);
      const checksBlocks = buildFormikChecksBlocks(action.checks);

      action.checks = checks;
      action.checksBlocks = checksBlocks;

      if (action.type === ACTION_TYPE.INDEX) {
        return buildFormikIndexAction(action);
      }

      if (action.type === ACTION_TYPE.EMAIL) {
        return buildFormikEmailAction(action);
      }

      if (action.type === ACTION_TYPE.SLACK) {
        return buildFormikSlackAction(action);
      }

      if (action.type === ACTION_TYPE.WEBHOOK) {
        return buildFormikWebhookAction(action);
      }

      if (action.type === ACTION_TYPE.JIRA) {
        return buildFormikJiraAction(action);
      }

      if (action.type === ACTION_TYPE.PAGERDUTY) {
        return buildFormikPagerdutyAction(action);
      }

      return action;
    });
  };

  return {
    actions: buildHelper(actions),
    resolve_actions: buildHelper(resolveActions),
  };
};

export const watchToFormik = (watch = {}) => {
  const formik = {
    ...cloneDeep(DEFAULT_WATCH),
    ...cloneDeep(watch),
  };

  const uiMeta = buildFormikMeta(watch);
  const { actions, resolve_actions: resolveActions, _ui, ...rest } = buildFormikSeverity({
    ...formik,
    _ui: uiMeta,
  });

  return {
    ...rest,
    _ui,
    checks: buildFormikChecks(formik.checks),
    ...buildFormikActions({ actions, resolve_actions: resolveActions, _ui }),
  };
};
