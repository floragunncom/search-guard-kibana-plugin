import { cloneDeep, isEmpty } from 'lodash';
import {
  stringifyPretty,
  arrayToComboBoxOptions
} from '../../../utils/helpers';
import buildFormikSchedule from './buildFormikSchedule';
import { GRAPH_DEFAULTS, WATCH_TYPE, DEFAULT_WATCH } from './constants';
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
    cc: arrayToComboBoxOptions(action.cc),
    bcc: arrayToComboBoxOptions(action.bcc),
    account: arrayToComboBoxOptions([action.account])
  };
}

export const buildFormikChecksBlocks = (checks = []) =>
  checks.map((check, index) => ({
    response: '',
    check: stringifyPretty(check),
    index,
  }));

export const buildFormikChecks = (checks = []) => stringifyPretty(checks);

export const buildFormikMeta = (watch = {}) => {
  return !isEmpty(watch._ui)
    ? { ...cloneDeep(GRAPH_DEFAULTS), ...watch._ui }
    : { ...cloneDeep(GRAPH_DEFAULTS), _watchType: WATCH_TYPE.JSON };
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
    // If watchType is undefined the default type is Json
    _ui: { ...cloneDeep(DEFAULT_WATCH._ui), _watchType: WATCH_TYPE.JSON },
    ...cloneDeep(watch)
  };

  const schedule = buildFormikSchedule(formik);
  const uiMetadata = buildFormikMeta(formik);
  const actions = buildFormikActions(formik.actions);

  return {
    ...formik,
    checks: buildFormikChecks(formik.checks),
    _checksBlocks: buildFormikChecksBlocks(formik.checks),
    actions,
    _ui: { ...uiMetadata },
    ...uiMetadata,
    ...schedule
  };
};
