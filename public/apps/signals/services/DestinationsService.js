import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class DestinationsService extends SignalsService {
  put(destination, id) {
    return super.put(`..${ROUTE_PATH.DESTINATION}/${id}`, destination);
  }

  get(id) {
    return super.get(id ? `..${ROUTE_PATH.DESTINATION}/${id}` : `..${ROUTE_PATH.DESTINATIONS}`);
  }

  delete(id) {
    return super.delete(`..${ROUTE_PATH.DESTINATION}/${id}`);
  }
}
