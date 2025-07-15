import { get } from 'lodash';
import { WATCH_ACTION_STATUS, WATCH_STATUS, APP_PATH, WATCH_ACTIONS } from '../../../utils/constants';

import {
  failedText,
  pausedText,
  acknowledgedText,
  unknownStatusText,
  executedText,
  actionText,
  activeText,
} from '../../../utils/i18n/watch';

const STATUS_COLORS = {
  ACTION_FAILED: ['#000', '#fff'],
  EXECUTION_FAILED: ['#000', '#fff'],
  NO_ACTION: ['#007515', '#fff'],
  // TODO THROTTLED
  // TODO PAUSED
  // SEVERITY COLORS
  info: ['#ccd5e2', '#000'],
  warning: ['#d7a64e', '#000'],
  error: ['#cf5e59', '#fff'],
  critical: ['#7F00FF', '#fff'],
  none: ['#007515', '#fff'],
};

/**
 * Turns a color pair into an object with background and text color
 * @param colors
 * @returns {{backgroundColor: *, color: *}|{backgroundColor: string, color: string}}
 */
const getColorsByArray = (colors) => {
  if (!colors) {
    return {
      backgroundColor: '#FEC514',
      color: '#000000',
    }
  }
  return {
    backgroundColor: colors[0],
    color: colors[1],
  }
}

/**
 * Uses the severity or status_code to determine the color pair
 * @param watch
 * @returns {{backgroundColor: *, color: *}|{backgroundColor: string, color: string}}
 */
const getColorsByWatch = (watch) => {
  const colorProperty = watch.severity ?? watch.status_code;
  return getColorsByArray(STATUS_COLORS[colorProperty]);
}


export const getSeverity = (watch) => {
  const severityLevel = watch.severity;

  // This should not be needed? Keeping just in case
  const severityMappingLevel = get(watch, 'severity_details.level', '');
  return severityMappingLevel || severityLevel;
}

export const getSeverityLabel = (watch, defaultValue = 'Okay') => {
  const severityLevel = getSeverity(watch);
  if (severityLevel) {
    // We just uppercase the first letter of the severity level
    return severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1);
  }
  return severityLevel ? severityLevel : defaultValue;
}

/**
 * Helper for the status column - icon, colors, label, ack function
 * @param watch
 * @param hasUnackedActions
 * @param severityLevel
 * @param handleAck
 * @returns {*|{type: string, "aria-label": string, nodeText, backgroundColor: *, color: *}|{type: string, backgroundColor: string, color: string, "aria-label": string, nodeText}|{type: string, "aria-label": string, nodeText: string, backgroundColor: *, color: *}}
 */
export const watchStatusToIconProps = (watch, hasUnackedActions, severityLevel, handleAck) => {
  let watchStatus = watch.status_code;
  if (!hasUnackedActions && watchStatus === WATCH_STATUS.ACTION_EXECUTED) {
    watchStatus = WATCH_STATUS.ACKED;
  }

  if (hasUnackedActions && watchStatus === WATCH_STATUS.ACKED) {
    watchStatus = WATCH_STATUS.ACTION_EXECUTED;
  }
  const defaultIconProps = {
    type: 'alert',
    'aria-label': 'Unknown Status',
    nodeText: unknownStatusText,
    ...getColorsByArray(null),
  };

  if (watch.active === false) {
    // In case the watch is disabled, an "eye" icon with a strikethrough will be displayed with the text "Paused".
    return {
      type: 'eyeClosed',
      backgroundColor: '#E3E8F2',
      color: '#07101F',
      'aria-label': 'Paused',
      nodeText: pausedText
    };
  }

  if (watch.status_code === null) {
    return  {
      type: 'eye',
        'aria-label': 'Okay',
        nodeText: "Pending",
        ...getColorsByArray(STATUS_COLORS.NO_ACTION)
    }
  }

  const iconProps = {
    // In case the watch failed (i.e. aborted unexpectedly due to an error) during the last execution, a "bug" icon will be displayed with the text "Failed". The color code is white text on black background.
    [WATCH_STATUS.EXECUTION_FAILED]: {
      type: 'bug',
      'aria-label': 'Failed',
      nodeText: failedText,
      ...getColorsByArray(STATUS_COLORS.EXECUTION_FAILED)
    },
    [WATCH_STATUS.ACTION_FAILED]: {
      type: 'bug',
      'aria-label': 'Failed',
      nodeText: failedText,
      ...getColorsByArray(STATUS_COLORS.ACTION_FAILED)
    },
    [WATCH_STATUS.ACTION_THROTTLED]: {
      type: 'bell',
      'aria-label': 'Throttled',
      nodeText: getSeverityLabel(watch,'Throttled'),
      ...getColorsByWatch(watch),
      onClick: handleAck,
    },
    // In case the watch has triggered notifications during its last execution, a bell icon will be displayed. Clicking on a bell will acknowledge the alert.
    // If the watch has severity levels configured, the name of the severity level will be displayed to the right of the bell icon. Additionally, the severity level is color coded.
    [WATCH_STATUS.ACTION_EXECUTED]: {
      type: 'bell',
      'aria-label': getSeverityLabel(watch, 'Action'),
      nodeText: getSeverityLabel(watch, actionText),
      onClick: handleAck,
      onClickAriaLabel: "Acknowledge watch",
      ...getColorsByWatch(watch)

    },
    // In case the watch has been successfully executed but did not trigger an action, an "eye" icon will be displayed with the text "Active". The color code is green.
    [WATCH_STATUS.NO_ACTION]: {
      type: 'eye',
      'aria-label': 'Okay',
      nodeText: "Okay",
      ...getColorsByWatch(watch)
    },
    [WATCH_STATUS.ACKED]: {
      type: 'bellSlash',
      'aria-label': 'Acknowledged',
      nodeText: getSeverityLabel(watch, 'Okay'),
      onClick: handleAck,
      onClickAriaLabel: "Un-acknowledge watch",
      ...getColorsByWatch(watch)
    },
  };

  const statusProps = iconProps[watchStatus];
  if (statusProps) {
    return statusProps;
  }

  return defaultIconProps;

};

/**
 * Helper for the action column - icon, colors, label, ack function
 * @param action
 * @param watchStatus
 * @param severityLevel
 * @returns {{type: string, "aria-label": string, nodeText: string, backgroundColor: (string|*), color: (string|*)}|*|{backgroundColor: string, color: string, type: string, "aria-label": string, nodeText}|{type: string, backgroundColor: string, color: string, "aria-label": string, nodeText}}
 */
export const actionStatusToIconProps = (watch, action, severityLevel) => {
  let actionStatus = action.status_code;
  let watchStatus = watch.status_code;
  const defaultIconProps = {
    backgroundColor: '#FEC514',
    color: '#000',
    type: 'alert',
    'aria-label': 'Unknown Status',
    nodeText: unknownStatusText,
  };


  if (watchStatus === WATCH_STATUS.NO_ACTION) {
    // Active watches get the "eye" icon with green color code.
    return {
      type: 'eye',
      backgroundColor: '#007515',
      color: '#fff',
      'aria-label': 'Active',
      nodeText: activeText,
    };
  }

  if (actionStatus === null) {
    return  {
      type: 'eye',
      'aria-label': 'Okay',
      nodeText: "Okay",
      ...getColorsByArray(STATUS_COLORS.NO_ACTION)
    }
  }

  // This is a bit of a hack to make sure that the "acked" status is displayed immediately
  // after the user has acknowledged an action or a watch.
  // Unfortunately, the status code from the API is not updated immediately.
  // Instead, we need to really on the ack_by field.
  // If null = not acked, if not null = acked.
  if (actionStatus === WATCH_ACTION_STATUS.ACTION_EXECUTED && action.ack_by) {
    actionStatus = WATCH_ACTION_STATUS.ACKED;
  } else if (actionStatus === WATCH_ACTION_STATUS.ACKED && !action.ack_by) {
    actionStatus = WATCH_ACTION_STATUS.ACTION_EXECUTED
  }

  let iconProps = {
    // If the checks of a watch were successful, but an individual action failed, it is displayed with a "bug" icon.
    [WATCH_ACTION_STATUS.ACTION_FAILED]: {
      type: 'bug',
      backgroundColor: '#000',
      color: '#fff',
      'aria-label': 'Failed',
      nodeText: failedText,
    },
    // Actions that were triggered during the last execution, get the bell icon.
    // If a severity level is configured, the level corresponds to the color code.
    // Otherwise, the color yellow will be used. The actions can be acknowledged by clicking on the bell icon.
    [WATCH_ACTION_STATUS.ACTION_EXECUTED]: {
      type: 'bell',
      //backgroundColor: severityLevel ? getSeverityColors(severityLevel).backgroundColor : '#FEC514',
      //color: severityLevel ? getSeverityColors(severityLevel).color : '#000',
      ...getColorsByWatch(watch),
      'aria-label': severityLevel ? severityLevel : 'Action',
      nodeText: executedText,
      tooltip: 'Click to acknowledge action',
    },
    [WATCH_ACTION_STATUS.ACTION_THROTTLED]: {
      type: 'bell',
      ...getColorsByWatch(watch),
      'aria-label': severityLevel ? severityLevel : 'Action',
      nodeText: executedText,
      tooltip: 'Click to acknowledge action',
    },
    [WATCH_ACTION_STATUS.ACKED]: {
      type: 'bellSlash',
      ...getColorsByWatch(watch),
      'aria-label': 'Acknowledged',
      nodeText: acknowledgedText,
      tooltip: 'Acknowledged, click to un-acknowledge',
    },
  }

  return iconProps[actionStatus] || defaultIconProps;
}
