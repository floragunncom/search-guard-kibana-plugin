import { cloneDeep, omit } from 'lodash';
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
