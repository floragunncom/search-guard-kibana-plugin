/* eslint-disable @osd/eslint/require-license-header */
import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export class SearchGuardService extends SignalsService {
  hasPermissions() {
    return super.post(`..${ROUTE_PATH.SEARCHGUARD.SIGNALS_HAS_PERMISSIONS}`);
  }
}
