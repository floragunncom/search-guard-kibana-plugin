import { cloneDeep, isEmpty } from 'lodash';
import {
  stringifyPretty,
  arrayToComboBoxOptions
} from '../../../utils/helpers';
import buildFormikSchedule from './buildFormikSchedule';
import { GRAPH_DEFAULTS, WATCH_TYPE } from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

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
    account: arrayToComboBoxOptions([action.account])
  };
}

export const buildFormikChecks = (checks = []) => stringifyPretty(checks);

export const buildFormikMeta = (watch = {}) => {
  return !isEmpty(watch._ui)
    ? { ...GRAPH_DEFAULTS, ...watch._ui }
    : { ...GRAPH_DEFAULTS, _watchType: WATCH_TYPE.JSON };
};

export const buildFormikThrottle = watch => {
  const [throttlePeriod, interval, unit] = watch.throttle_period.match(/^(\d+)([smdh])$/);
  return {
    ...watch,
    throttle_period: throttlePeriod,
    _throttle_period: { interval: +interval, unit }
  };
};

export const buildFormikIndexAction = (action = {}) => ({
  ...action,
  index: [{ label: action.index }],
  checks: stringifyPretty(action.checks || [])
});

export const buildFormikActions = (actions = []) => actions.map(action => {
  let _action = buildFormikThrottle(action);

  if (action.type === ACTION_TYPE.INDEX) {
    _action = buildFormikIndexAction(_action);
  }

  if (action.type === ACTION_TYPE.EMAIL) {
    _action = buildFormikEmailAction(_action);
  }

  if (action.type === ACTION_TYPE.SLACK) {
    _action = buildFormikSlackAction(_action);
  }

  if (action.type === ACTION_TYPE.WEBHOOK) {
    _action = buildFormikWebhookAction(_action);
  }

  return _action;
});

export const watchToFormik = watch => {
  const formik = cloneDeep(watch);
  const schedule = buildFormikSchedule(formik);
  const uiMetadata = buildFormikMeta(formik);
  const actions = buildFormikActions(formik.actions);
  const checks = buildFormikChecks(formik.checks);

  return {
    ...formik,
    actions,
    checks,
    ...uiMetadata,
    _ui: { ...uiMetadata },
    ...schedule
  };
};
