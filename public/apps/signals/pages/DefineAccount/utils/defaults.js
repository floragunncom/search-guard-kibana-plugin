import { ACCOUNT_TYPE } from '../../Accounts/utils/constants';

export const email = {
  type: ACCOUNT_TYPE.EMAIL,
  _id: '',
  host: 'localhost',
  port: 1025,
  mime_layout: 'default',
  session_timeout: 120000,
  user: '',
  password: '',
  default_from: '',
  default_to: [],
  default_cc: [],
  default_bcc: [],
  enable_tls: false,
  enable_start_tls: false,
  trust_all: false,
  trusted_hosts: [],
  simulate: false,
  debug: false,
  proxy_host: '',
  proxy_port: '',
  proxy_user: '',
  proxy_password: '',
};

export const slack = {
  type: ACCOUNT_TYPE.SLACK,
  _id: '',
  url: '',
};

export const jira = {
  type: ACCOUNT_TYPE.JIRA,
  _id: '',
  user_name: '',
  auth_token: '',
  url: 'https://floragunn.atlassian.net/',
};

export const pagerduty = {
  type: ACCOUNT_TYPE.PAGERDUTY,
  _id: '',
  integration_key: '',
  uri: '',
};
