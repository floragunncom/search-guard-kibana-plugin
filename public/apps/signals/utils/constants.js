import { APP_NAME, ROUTE_PATH } from '../../../../utils/signals/constants';

export {
  APP_NAME,
  ROUTE_PATH,
  DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  DEFAULT_DATEFIELD_RANGE_QUERY_LT,
  WATCH_EXAMPLES
} from '../../../../utils/signals/constants';

export const APP_PATH = {
  DESTINATIONS: '/destinations',
  DESTINATION: '/destination',
  DEFINE_DESTINATION: '/define-destination',
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
  REPO: 'https://github.com/floragunncom/search-guard-kibana-plugin',
  CRON_EXPRESSION: 'https://www.freeformatter.com/cron-expression-generator-quartz.html'
}

export const CODE_EDITOR = {
  TAB_SIZE: 2,
  USE_SOFT_TABS: true
};

export const FLYOUTS = {
  INSPECT_JSON: 'inspectJson',
  CUSTOM: 'customFlyout',
  WATCHES_HELP: 'watchesHelp'
};

export const MODALS = {
  CONFIRM_DELETION: 'confirmDeletion'
};
