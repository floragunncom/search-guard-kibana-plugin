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
