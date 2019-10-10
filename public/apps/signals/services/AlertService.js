import queryString from 'query-string';
import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class AlertService extends SignalsService {
  get({ dateGte, dateLt, watchId }) {
    const query = queryString.stringify({ dateGte, dateLt, watchId });
    let path = `..${ROUTE_PATH.ALERTS}`;
    if (query) path += `?${query}`;

    return super.get(path);
  }

  delete({ id, index }) {
    return super.delete(encodeURI(`..${ROUTE_PATH.ALERT}/${index}/${id}`));
  }
}
