import { DESTINATION_TYPE } from '../../Destinations/utils/constants';

export const EMAIL = {
  type: DESTINATION_TYPE.EMAIL,
  host: 'localhost',
  port: 1025,
  mime_layout: 'default',
  session_timeout: 120000,
  default_subject: 'SG Signals message',
  _id: ''
};

export const SLACK = {
  type: DESTINATION_TYPE.SLACK,
  _id: '',
  url: ''
}
