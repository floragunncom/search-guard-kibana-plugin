/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  ES_SCROLL_SETTINGS,
} from '../../../../common/signals/constants';

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
  ALERT: '/alert',
};

export const SEARCH_TYPE = {
  GRAPH: 'graph',
  QUERY: 'query',
};

export const DOC_LINKS = {
  REPO: 'https://git.floragunn.com/search-guard/search-guard-kibana-plugin',
  INPUTS: {
    STATIC: 'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-static',
    HTTP: 'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-http',
    SEARCH_REQUEST:
      'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-elasticsearch',
  },
  CONDITIONS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-conditions-script',
  TRANSFORMS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-transformations',
  CALCS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-calculations',
  TRIGGERS: {
    SCHEDULE: 'https://docs.search-guard.com/latest/elasticsearch-alerting-triggers-schedule',
  },
  HOW_SIGNALS_WORKS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-how-it-works',
  ACCOUNTS: 'https://docs.search-guard.com/latest/elasticsearch-alerting-accounts',
  ALERTING_TRIGGERS_OVERVIEW:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-triggers-overview',
  ALERTING_INPUT_OVERVIEW:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-inputs-overview',
  ALERTING_ACTIONS_OVERVIEW:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-actions-overview',
  ALERTING_CHAINING_CHECKS:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-chaining-checks',
  ALERTING_ACTIONS_SLACK:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-actions-slack',
  ALERTING_ACTIONS_INDEX:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-actions-index',
  ALERTING_ACTIONS_EMAIL:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-actions-email',
  ALERTING_ACTIONS_WEBHOOK:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-actions-webhook',
  ALERTING_ACTIONS_PAGERDUTY:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-actions-pagerduty',
  ALERTING_ACTIONS_JIRA: 'https://docs.search-guard.com/latest/elasticsearch-alerting-actions-jira',
  USING_RESOLVE_ACTIONS:
    'https://docs.search-guard.com/latest/elasticsearch-alerting-severity#using-resolve-actions',
  ALERTING_SEVERITY: 'https://docs.search-guard.com/latest/elasticsearch-alerting-severity',
  ALERTING_THROTTLING: 'https://docs.search-guard.com/latest/elasticsearch-alerting-throttling',
};

export const FLYOUTS = {
  INSPECT_JSON: 'inspectJson',
  CUSTOM: 'customFlyout',
  WATCHES_HELP: 'watchesHelp',
  CHECK_EXAMPLES: 'checkExamples',
};

export const MODALS = {
  CONFIRM_DELETION: 'confirmDeletion',
  CONFIRM: 'confirm',
  ERROR_TOAST_DETAILS: 'errorToastDetails',
};
