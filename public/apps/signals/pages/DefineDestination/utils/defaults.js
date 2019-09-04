import { DESTINATION_TYPE } from '../../Destinations/utils/constants';

export const email = {
  type: DESTINATION_TYPE.EMAIL,
  host: 'localhost',
  port: 1025,
  mime_layout: 'default',
  session_timeout: 120000,
  _id: '',
  user: '',
  password: '',
  default_from: '',
  default_to: [],
  default_cc: [],
  default_bcc: [],
  enable_tls: true,
  enable_start_tls: false,
  trust_all: false,
  trusted_hosts: [],
  simulate: false,
  debug: false,
  proxy_host: '',
  proxy_port: '',
  proxy_user: '',
  proxy_password: ''
};

export const slack = {
  type: DESTINATION_TYPE.SLACK,
  _id: '',
  url: ''
};
