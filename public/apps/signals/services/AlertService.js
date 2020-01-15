import queryString from 'query-string';
import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class AlertService extends SignalsService {
  search(query = {}) {
    return super.post(`..${ROUTE_PATH.ALERTS}`, { query });
  }

  delete({ id, index }) {
    return super.delete(encodeURI(`..${ROUTE_PATH.ALERT}/${index}/${id}`));
  }
}
