import moment from 'moment';
import { get } from 'lodash';
import { WATCH_ACTION_STATUS, WATCH_STATUS, APP_PATH } from '../../../utils/constants';
import {
  failedText,
  acknowledgedText,
  throttledText,
  noActionsText,
  unknownStatusText,
  executedText,
} from '../../../utils/i18n/watch';

const { ACTION_FAILED, ACKED, ACTION_THROTTLED, ACTION_EXECUTED } = WATCH_ACTION_STATUS;

const { EXECUTION_FAILED, NO_ACTION } = WATCH_STATUS;

const SIMPLE_QUERY_FIELDS = [
  '_name^3',
  '_tenant',
  'severity.value',
  'actions.name^2',
  'actions.type',
  'actions.account',
  'actions.severity',
  'actions.from',
  'actions.to',
  'actions.cc',
  'actions.request.body',
  'actions.text',
  'actions.text_body',
  'actions.subject',
  'actions.issue.type',
  'actions.issue.summary',
  'actions.issue.description',
  'actions.issue.label',
  'actions.issue.priority',
  'resolve_actions.name^2',
  'resolve_actions.type',
  'resolve_actions.account',
  'resolve_actions.severity',
  'resolve_actions.from',
  'resolve_actions.to',
  'resolve_actions.cc',
  'resolve_actions.request.body',
  'resolve_actions.text',
  'resolve_actions.text_body',
  'resolve_actions.subject',
  'resolve_actions.issue.type',
  'resolve_actions.issue.summary',
  'resolve_actions.issue.description',
  'resolve_actions.issue.label',
  'resolve_actions.issue.priority',
];

export const actionAndWatchStatusToIconProps = (actionStatus = '') => {
  const defaultIconProps = {
    color: 'warning',
    type: 'alert',
    'aria-label': 'Unknown Status',
    nodeText: unknownStatusText,
  };

  const iconProps = {
    [NO_ACTION]: {
      type: 'alert',
      color: 'warning',
      'aria-label': 'No action',
      nodeText: noActionsText,
    },
    [EXECUTION_FAILED]: {
      type: 'faceSad',
      color: 'danger',
      'aria-label': 'Failed',
      nodeText: failedText,
    },
    [ACTION_FAILED]: {
      type: 'faceSad',
      color: 'danger',
      'aria-label': 'Failed',
      nodeText: failedText,
    },
    [ACKED]: {
      type: 'check',
      color: '#007515',
      'aria-label': 'Acknowledged',
      nodeText: acknowledgedText,
    },
    [ACTION_THROTTLED]: {
      type: 'alert',
      color: 'warning',
      'aria-label': 'Throttled',
      nodeText: throttledText,
    },
    [ACTION_EXECUTED]: {
      type: 'faceHappy',
      color: '#007515',
      'aria-label': 'Executed',
      nodeText: executedText,
    }
  };

  return iconProps[actionStatus] || defaultIconProps;
};

export const dateFormat = dateString => moment(dateString).format('DD/MM/YY, hh:mm:ss');

export const buildESQuery = query => {
  const must = get(query, 'bool.must', []);

  if (!!must.length) {
    const index = must.findIndex(clause => clause.simple_query_string);

    if (index !== -1) {
      query.bool.must[index].simple_query_string.fields = SIMPLE_QUERY_FIELDS;
      if (query.bool.must[index].simple_query_string.query.slice(-1) !== '*') {
        query.bool.must[index].simple_query_string.query += '*';
      }
    }
  }

  return query;
};

export const getResourceEditUri = (id) => `${APP_PATH.DEFINE_WATCH}?id=${encodeURIComponent(id)}`;
export const getWatchRelatedAlertsUri = (id) =>
  `${APP_PATH.ALERTS}?watchId=${encodeURIComponent(id)}`;
