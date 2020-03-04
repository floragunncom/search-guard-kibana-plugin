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
} from '../../../../utils/signals/constants';

export const APP_PATH = {
  HOME: '/',
  ACCOUNTS: '/accounts',
  ACCOUNT: '/account',
  DEFINE_ACCOUNT: '/define-account',
  DASHBOARD: '/dashboard',
  WATCHES: '/watches',
  WATCH: '/watch',
  DEFINE_WATCH: '/define-watch',
  ALERTS: '/alerts',
  ALERT: '/alert'
};

export const SEARCH_TYPE = {
  GRAPH: 'graph',
  QUERY: 'query',
};

export const DOC_LINKS = {
  REPO: 'https://git.floragunn.com/search-guard/search-guard-kibana-plugin',
  GETTING_STARTED: 'https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started',
  INPUTS: {
    STATIC: 'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-static',
    HTTP: 'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-http',
    SEARCH: 'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-elasticsearch',
  },
  CONDITIONS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-conditions-script',
  TRANSFORMS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-transformations',
  CALCS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-calculations',
  TRIGGERS: {
    SCHEDULE: 'https://docs.search-guard.com/latest/elasticsearch-alerting-triggers-schedule'
  },
};

export const FLYOUTS = {
  INSPECT_JSON: 'inspectJson',
  CUSTOM: 'customFlyout',
  WATCHES_HELP: 'watchesHelp',
  CHECK_EXAMPLES: 'checkExamples'
};

export const MODALS = {
  CONFIRM_DELETION: 'confirmDeletion',
  CONFIRM: 'confirm'
};
