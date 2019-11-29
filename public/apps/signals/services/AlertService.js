import queryString from 'query-string';
import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class AlertService extends SignalsService {
  get({ dateGte, dateLt, watchId, statusCodes }) {
    const query = queryString.stringify({ dateGte, dateLt, watchId, statusCodes });
    let path = `..${ROUTE_PATH.ALERTS}`;
    if (query) path += `?${query}`;

    return super.get(path);
  }

  getByQuery(query) {
    return super.post(`..${ROUTE_PATH.ALERTS}`, { ...query });
  }

  delete({ id, index }) {
    return super.delete(encodeURI(`..${ROUTE_PATH.ALERT}/${index}/${id}`));
  }
}
