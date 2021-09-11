/* eslint-disable @osd/eslint/require-license-header */
export const APP_NAME = 'searchguard-signals';
export const APP_DESCRIPTION = 'Search Guard Signals';

export const INDEX = {
  ALERTS: '.signals_log_*',
  ALERT_DOC_TYPE: '_doc',
};

export const BASE_URI = `/api/${APP_NAME}`;
export const ROUTE_PATH = {
  WATCH: `${BASE_URI}/watch`,
  WATCHES: `${BASE_URI}/watches`,
  ACCOUNT: `${BASE_URI}/account`,
  ACCOUNTS: `${BASE_URI}/accounts`,
  WATCH_EXECUTE: `${BASE_URI}/watch/_execute`,
  WATCH_EXECUTE_GRAPH: `${BASE_URI}/watch/_execute_graph`,
  ALERT: `${BASE_URI}/alert`,
  ALERTS: `${BASE_URI}/alerts`,
  SEARCH: `${BASE_URI}/_search`,
  MAPPINGS: `${BASE_URI}/_mappings`,
  INDICES: `${BASE_URI}/_indices`,
  ALIASES: `${BASE_URI}/_aliases`,
  SEARCHGUARD: {
    SIGNALS_HAS_PERMISSIONS: `${BASE_URI}/searchguard/signals_has_permissions`,
  },
};

export const MAX_DOC_COUNT_SEARCH = 800;
export const DEFAULT_DATEFIELD = 'execution_end';
export const DEFAULT_DATEFIELD_RANGE_QUERY_GTE = 'now-30m';
export const DEFAULT_DATEFIELD_RANGE_QUERY_LT = 'now';

export const ES_SCROLL_SETTINGS = {
  KEEPALIVE: '25s',
  PAGE_SIZE: 10,
};

export const WATCH_EXAMPLES = {
  AVG_TICKET_PRICE: 'avg_ticket_price',
  BAD_WEATHER: 'bad_weather',
  CHANGE_IN_MEMORY: 'change_in_memory',
  MAX_MEMORY: 'max_memory',
  MEMORY_USAGE: 'memory_usage',
  MIN_PRODUCT_PRICE: 'min_product_price',
};

export const NO_MULTITENANCY_TENANT = '_main';

export const WATCH_STATUS = {
  EXECUTION_FAILED: 'EXECUTION_FAILED',
  ACTION_EXECUTED: 'ACTION_EXECUTED',
  NO_ACTION: 'NO_ACTION',
  ACKED: 'ACKED',
};

export const WATCH_ACTION_STATUS = {
  ACTION_FAILED: 'ACTION_FAILED',
  ACTION_THROTTLED: 'ACTION_THROTTLED',
  ACTION_EXECUTED: 'ACTION_EXECUTED',
  ACKED: 'ACKED',
};

export const PERMISSIONS_FOR_ACCESS = ['cluster:admin:searchguard:tenant:signals:watch/get'];
