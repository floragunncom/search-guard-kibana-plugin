import { stringifyPretty } from '../../../../../utils/helpers';
import { ACTION_TYPE } from './constants';
import { TIME_PERIOD_UNITS } from '../../../utils/constants';

const { SECONDS } = TIME_PERIOD_UNITS;

export const webhook = {
  throttle_period: {
    interval: 1,
    unit: SECONDS
  },
  type: ACTION_TYPE.WEBHOOK,
  name: 'mywebhook',
  request: {
    method: 'POST',
    url: '',
    body: 'Total: {{data.mysearch.hits.total.value}}',
    headers: stringifyPretty({ 'Content-type': 'application/json' }),
  }
};

export const slack = {
  throttle_period: {
    interval: 1,
    unit: SECONDS
  },
  type: ACTION_TYPE.SLACK,
  name: 'myslacksink',
  account: [],
  from: 'signals',
  text: 'Total: {{data.mysearch.hits.total.value}}',
  icon_emoji: ':got:'
};

export const index = {
  throttle_period: {
    interval: 1,
    unit: SECONDS
  },
  type: ACTION_TYPE.INDEX,
  name: 'myelasticsearch',
  index: [],
  checks: stringifyPretty([])
};

export const email = {
  throttle_period: {
    interval: 1,
    unit: SECONDS
  },
  type: ACTION_TYPE.EMAIL,
  name: 'myemail',
  from: 'signals@localhost',
  to: [],
  cc: [],
  bcc: [],
  subject: 'Signals message',
  text_body: 'Total: {{data.mysearch.hits.total.value}}',
  account: []
};
