import { stringifyPretty } from '../../../../../utils/helpers';
import { ACTION_TYPE } from './constants';

export const webhook = {
  _throttle_period: {
    interval: 1,
    unit: 's'
  },
  throttle_period: '1s',
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
  _throttle_period: {
    interval: 1,
    unit: 's'
  },
  throttle_period: '1s',
  type: ACTION_TYPE.SLACK,
  name: 'myslacksink',
  account: [],
  from: 'signals',
  text: 'Total: {{data.mysearch.hits.total.value}}',
  icon_emoji: ':got:'
};

export const index = {
  _throttle_period: {
    interval: 1,
    unit: 's'
  },
  throttle_period: '1s',
  type: ACTION_TYPE.INDEX,
  name: 'myelasticsearch',
  index: [],
  checks: stringifyPretty([])
};

export const email = {
  _throttle_period: {
    interval: 1,
    unit: 's'
  },
  throttle_period: '1s',
  type: ACTION_TYPE.EMAIL,
  name: 'myemail',
  from: 'signals@localhost',
  to: [],
  subject: 'Signals message',
  text_body: 'Total: {{data.mysearch.hits.total.value}}',
  account: []
};
