import {
  WATCH_ACTION_STATUS,
  WATCH_STATUS,
  DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  DEFAULT_DATEFIELD_RANGE_QUERY_LT
} from '../../../utils/constants';

export const TABLE_SORT_FIELD = 'execution_end';
export const TABLE_SORT_DIRECTION = 'desc';

export const DATE_PICKER = {
  REFRESH_INTERVAL: 3000, // ms
  IS_PAUSED: 'true', // Must be string because it is a URL param
};

export const DEFAULT_URL_PARAMS = {
  dateGte: DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  dateLt: DEFAULT_DATEFIELD_RANGE_QUERY_LT,
  refreshInterval: DATE_PICKER.REFRESH_INTERVAL,
  isPaused: DATE_PICKER.IS_PAUSED,
};

export const SEARCH_TIMEOUT = 1500; // ms
