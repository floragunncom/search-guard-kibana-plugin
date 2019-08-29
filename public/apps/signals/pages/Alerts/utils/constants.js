export const ACTION_FAILED = 'ACTION_FAILED';
export const ACTION_THROTTLED = 'ACTION_THROTTLED';
export const ACTION_TRIGGERED = 'ACTION_TRIGGERED';
export const NO_ACTION = 'NO_ACTION';

export const ALERT_STATUS = {
  [ACTION_FAILED]: {
    iconType: 'faceSad',
    color: 'danger'
  },
  [ACTION_THROTTLED]: {
    iconType: 'alert',
    color: 'warning'
  },
  [NO_ACTION]: {
    iconType: 'alert',
    color: 'warning'
  },
  [ACTION_TRIGGERED]: {
    iconType: 'faceHappy',
    color: 'secondary'
  }
};

export const TABLE_SORT_FIELD = 'execution_end';
export const TABLE_SORT_DIRECTION = 'desc';
