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

const getColorsByWatch = (watch) => {
  const colorProperty = watch.severity ?? watch.status_code;
  let colors = STATUS_COLORS[colorProperty];
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
 * Array with background color and text color for each severity
 * A bit different than the color codes in DefineWatch
 */
const SEVERITY_COLORS = {
  info: ['#ccd5e2', '#000'],
  warning: ['#d7a64e', '#000'],
  error: ['#cf5e59', '#fff'],
  critical: ['#7F00FF', '#fff'],
  none: ['#ffffff', '#000'],
};



const getSeverityColors = (severity) => {
  let severityColors = SEVERITY_COLORS[severity];
  if (!severityColors) {
    return {
      backgroundColor: '#FEC514',
      color: '#000000',
    }
  }
  return {
    backgroundColor: severityColors[0],
    color: severityColors[1],
  }
}

export const getSeverity = (watch) => {
  //const severityLevel = get(watch, '_ui.state.last_execution.severity.level', '');
  const severityLevel = watch.severity;

  // This should not be needed?
  const severityMappingLevel = get(watch, 'severity_details.level', '');
  /*
  const severityMappingLevel = get(
    watch,
    '_ui.state.last_execution.severity.mapping_element.level',
    ''
  );
   */
  return severityMappingLevel || severityLevel;
}

export const watchStatusToIconProps = (watch, active, severityLevel, handleAck) => {
  const watchStatus = watch.status_code;
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
      nodeText: severityLevel ? severityLevel : 'Throttled',
      ...getColorsByWatch(watch),
      onClick: handleAck,
    },
    // In case the watch has triggered notifications during its last execution, a bell icon will be displayed. Clicking on a bell will acknowledge the alert.
    // If the watch has severity levels configured, the name of the severity level will be displayed to the right of the bell icon. Additionally, the severity level is color coded.
    [WATCH_STATUS.ACTION_EXECUTED]: {
      type: 'bell',
      'aria-label': severityLevel ? severityLevel : 'Action',
      nodeText: severityLevel ? severityLevel : actionText,
      onClick: handleAck,
      onClickAriaLabel: "Acknowledge action",
      ...getColorsByWatch(watch)

    },
    // In case the watch has been successfully executed but did not trigger an action, an "eye" icon will be displayed with the text "Active". The color code is green.
    [WATCH_STATUS.NO_ACTION]: {
      type: 'eye',
      'aria-label': 'Active',
      nodeText: activeText,
      ...getColorsByWatch(watch)
    },
    [WATCH_STATUS.ACKED]: {
      type: 'eye',
      'aria-label': 'Acknowledged',
      nodeText: severityLevel ? severityLevel : activeText,
      ...getColorsByWatch(watch)
    },
  };

  const statusProps = iconProps[watchStatus];
  if (statusProps) {
    return statusProps;
  }

  return defaultIconProps;

};

export const actionStatusToIconProps = (actionStatus, watchStatus, severityLevel) => {
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
      backgroundColor: severityLevel ? getSeverityColors(severityLevel).backgroundColor : '#FEC514',
      color: severityLevel ? getSeverityColors(severityLevel).color : '#000',
      'aria-label': severityLevel ? severityLevel : 'Action',
      nodeText: executedText,
      tooltip: 'Click to acknowledge action',
    },
    [WATCH_ACTION_STATUS.ACTION_THROTTLED]: {
      type: 'bell',
      backgroundColor: severityLevel ? getSeverityColors(severityLevel).backgroundColor : '#FEC514',
      color: severityLevel ? getSeverityColors(severityLevel).color : '#000',
      'aria-label': severityLevel ? severityLevel : 'Action',
      nodeText: executedText,
      tooltip: 'Click to acknowledge action',
    },
    [WATCH_ACTION_STATUS.ACKED]: {
      type: 'bellSlash',
      backgroundColor: severityLevel ? getSeverityColors(severityLevel).backgroundColor : '#FEC514',
      color: severityLevel ? getSeverityColors(severityLevel).color : '#000',
      'aria-label': 'Acknowledged',
      nodeText: acknowledgedText,
      tooltip: 'Acknowledged, click to un-acknowledge',
    },
  }

  return iconProps[actionStatus] || defaultIconProps;
}
