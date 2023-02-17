/* eslint-disable @osd/eslint/require-license-header */
import AlertingService from './AlertingService';
import { ROUTE_PATH } from '../utils/constants';

export class SecurityService extends AlertingService {
  hasPermissions() {
    return super.post(`..${ROUTE_PATH.SECURITY.ALERTING_HAS_PERMISSIONS}`);
  }
}
