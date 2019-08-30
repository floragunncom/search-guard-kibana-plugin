import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class WatchService extends SignalsService {
  execute(watch) {
    return this.httpClient.post(`..${ROUTE_PATH.WATCH_EXECUTE}`, { watch })
      .then(({ data }) => data);
  }

  executeGraph(request) {
    return super.post(`..${ROUTE_PATH.WATCH_EXECUTE_GRAPH}`, { request });
  }

  put(watch, id) {
    return super.put(`..${ROUTE_PATH.WATCH}/${id}`, watch);
  }

  get(id) {
    return super.get(id ? `..${ROUTE_PATH.WATCH}/${id}` : `..${ROUTE_PATH.WATCHES}`);
  }

  delete(id) {
    return super.delete(`..${ROUTE_PATH.WATCH}/${id}`);
  }
}
