import { cloneDeep, isEmpty } from 'lodash';
import {
  stringifyPretty,
  arrayToComboBoxOptions,
} from '../../../utils/helpers';
import {
  unfoldMultiLineString,
} from './unfoldMultiLineString';
import buildFormikSchedule from './buildFormikSchedule';
import {
  GRAPH_DEFAULTS,
  WATCH_TYPE,
  DEFAULT_WATCH,
  RESULT_FIELD_DEFAULTS,
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';
import buildFormikTimePeriod from './buildFormikTimePeriod';

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

  return !isEmpty(_ui) ? ui : Object.assign(ui, { watchType: WATCH_TYPE.JSON });
};

export const buildFormikThrottle = watch => ({
  ...watch,
  throttle_period: buildFormikTimePeriod(watch.throttle_period),
});

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
    ...cloneDeep(watch),
  };

  return {
    ...formik,
    _ui: buildFormikMeta(watch),
    checks: buildFormikChecks(formik.checks),
    actions: buildFormikActions(formik.actions),
  };
};
