import { cloneDeep } from 'lodash';
import { stringifyPretty } from '../../../../../utils/helpers';
import { ACTION_TYPE } from './constants';
import { TIME_PERIOD_UNITS } from '../../../utils/constants';

const { SECONDS } = TIME_PERIOD_UNITS;

const COMMON = {
  checks: '[]',
  severity: [],
  throttle_period: {
    interval: 1,
    unit: SECONDS,
  },
};

export const webhook = {
  type: ACTION_TYPE.WEBHOOK,
  name: 'mywebhook',
  request: {
    method: 'POST',
    url: '',
    body: 'Total: {{data.mysearch.hits.total.value}}',
    headers: stringifyPretty({ 'Content-type': 'application/json' }),
  },
  ...cloneDeep(COMMON),
};

export const slack = {
  type: ACTION_TYPE.SLACK,
  name: 'myslacksink',
  account: [],
  from: 'signals',
  text: 'Total: {{data.mysearch.hits.total.value}}',
  icon_emoji: ':got:',
  ...cloneDeep(COMMON),
};

export const index = {
  type: ACTION_TYPE.INDEX,
  name: 'myelasticsearch',
  index: [],
  ...cloneDeep(COMMON),
};

export const email = {
  type: ACTION_TYPE.EMAIL,
  name: 'myemail',
  from: 'signals@localhost',
  to: [],
  cc: [],
  bcc: [],
  subject: 'Signals message',
  text_body: 'Total: {{data.mysearch.hits.total.value}}',
  account: [],
  ...cloneDeep(COMMON),
};

export const jira = {
  type: ACTION_TYPE.JIRA,
  name: 'myjira',
  project: 'SD',
  name: 'jira issue',
  issue: {
    type: 'Bug',
    summary: 'Test',
    description: 'Total: {{data.mysearch.hits.total.value}}',
    label: '',
    priority: '',
    parent: '',
    component: '',
  },
  ...cloneDeep(COMMON),
};

export const pagerduty = {
  type: ACTION_TYPE.PAGERDUTY,
  name: 'mypagerduty',
  event: {
    dedup_key: 'x',
    payload: {
      summary: 'Total: {{data.mysearch.hits.total.value}}',
      source: 'My source',
      custom_details: '["total": data.mysearch.hits.total.value, "foo": "bar"]',
    },
  },
  ...cloneDeep(COMMON),
};
