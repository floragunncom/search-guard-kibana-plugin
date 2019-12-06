import moment from 'moment';
import { WATCH_ACTION_STATUS, WATCH_STATUS } from '../../../utils/constants';
import {
  failedText,
  acknowledgedText,
  throttledText,
  triggeredText,
  noActionsText,
  unknownStatusText
} from '../../../utils/i18n/watch';

const {
  ACTION_FAILED,
  ACKED,
  ACTION_THROTTLED,
  ACTION_TRIGGERED
} = WATCH_ACTION_STATUS;

const {
  EXECUTION_FAILED,
  NO_ACTION
} = WATCH_STATUS;

export const actionAndWatchStatusToIconProps = (actionStatus = '') => {
  const defaultIconProps = {
    color: 'warning',
    type: 'alert',
    'aria-label': 'Unknown Status',
    nodeText: unknownStatusText
  };

  const iconProps = {
    [NO_ACTION]: {
      type: 'alert',
      color: 'warning',
      'aria-label': 'No action',
      nodeText: noActionsText
    },
    [EXECUTION_FAILED]: {
      type: 'faceSad',
      color: 'danger',
      'aria-label': 'Failed',
      nodeText: failedText
    },
    [ACTION_FAILED]: {
      type: 'faceSad',
      color: 'danger',
      'aria-label': 'Failed',
      nodeText: failedText
    },
    [ACKED]: {
      type: 'check',
      color: '#007515',
      'aria-label': 'Acknowledged',
      nodeText: acknowledgedText
    },
    [ACTION_THROTTLED]: {
      type: 'alert',
      color: 'warning',
      'aria-label': 'Throttled',
      nodeText: throttledText
    },
    [ACTION_TRIGGERED]: {
      type: 'faceHappy',
      color: '#007515',
      'aria-label': 'Triggered',
      nodeText: triggeredText
    }
  };

  return iconProps[actionStatus] || defaultIconProps;
};

export const dateFormat = dateString =>
  moment(dateString).format('DD/MM/YY, hh:mm:ss');
