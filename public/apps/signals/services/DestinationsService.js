import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class DestinationsService extends SignalsService {
  constructor(httpClient, type) {
    super(httpClient);
    this.type = type;
  }

  put(destination, id, type = this.type) {
    return super.put(`..${ROUTE_PATH.DESTINATION}/${type}/${id}`, destination);
  }

  get(id, type = this.type) {
    const path = id
      ? `..${ROUTE_PATH.DESTINATION}/${type}/${id}`
      : `..${ROUTE_PATH.DESTINATIONS}`;
    return super.get(path);
  }

  delete(id, type = this.type) {
    return super.delete(`..${ROUTE_PATH.DESTINATION}/${type}/${id}`);
  }
}
