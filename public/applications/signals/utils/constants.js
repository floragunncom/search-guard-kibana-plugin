export {
  APP_NAME,
  ROUTE_PATH,
  DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  DEFAULT_DATEFIELD_RANGE_QUERY_LT,
  WATCH_EXAMPLES,
  WATCH_ACTION_STATUS,
  WATCH_STATUS,
  DEFAULT_DATEFIELD,
  INDEX,
  ES_SCROLL_SETTINGS
} from '../../../../common/signals/constants';

export const APP_PATH = {
  HOME: '/',
  ACCOUNTS: '/accounts',
  ACCOUNT: '/account',
  DEFINE_ACCOUNT: '/define-account',
  DEFINE_JSON_ACCOUNT: '/define-json-account',
  DASHBOARD: '/dashboard',
  WATCHES: '/watches',
  WATCH: '/watch',
  DEFINE_WATCH: '/define-watch',
  DEFINE_JSON_WATCH: '/define-json-watch',
  ALERTS: '/alerts',
  ALERT: '/alert'
};

export const ACCOUNT_ACTIONS = {
  READ_ACCOUNT: 'read-account',
  DEFINE_JSON_ACCOUNT: 'define-json-account',
};

export const WATCH_ACTIONS = {
  READ_WATCH: 'read-watch',
  DEFINE_JSON_WATCH: 'define-json-watch',
};

export const SEARCH_TYPE = {
  GRAPH: 'graph',
  QUERY: 'query',
};

export const DOC_LINKS = {
  GET_STARTED: 'https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started',
  REPO: 'https://git.floragunn.com/search-guard/search-guard-kibana-plugin',
  INPUTS: {
    STATIC: 'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-static',
    HTTP: 'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-http',
    SEARCH_REQUEST:
      'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html',
  },
  CONDITIONS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-conditions-script',
  TRANSFORMS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-transformations',
  CALCS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-calculations',
  TRIGGERS: {
    SCHEDULE: 'https://docs.search-guard.com/latest/elasticsearch-alerting-triggers-schedule'
  }
};

export const FLYOUTS = {
  INSPECT_JSON: 'inspectJson',
  CUSTOM: 'customFlyout',
  WATCHES_HELP: 'watchesHelp',
  CHECK_EXAMPLES: 'checkExamples'
};

export const MODALS = {
  CONFIRM_DELETION: 'confirmDeletion',
  CONFIRM: 'confirm',
  ERROR_TOAST_DETAILS: 'errorToastDetails',
};
