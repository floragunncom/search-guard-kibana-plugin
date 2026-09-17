/* eslint-disable @kbn/eslint/require-license-header */
import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export class SearchGuardService extends SignalsService {
  async hasPermissions() {
    const { resp } = await super.post(`..${ROUTE_PATH.SEARCHGUARD.SIGNALS_HAS_PERMISSIONS}`);
    return resp;
  }
}
