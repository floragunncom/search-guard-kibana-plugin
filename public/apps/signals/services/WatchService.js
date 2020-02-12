import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class WatchService extends SignalsService {
  execute({ watch, simulate = false, skipActions = true } = {}) {
    return this.httpClient
      .post(`..${ROUTE_PATH.WATCH_EXECUTE}`, {
        watch,
        simulate,
        skipActions,
      })
      .then(({ data }) => data);
  }

  executeGraph(request) {
    return super.post(`..${ROUTE_PATH.WATCH_EXECUTE_GRAPH}`, { request });
  }

  put(watch, id) {
    return super.put(`..${ROUTE_PATH.WATCH}/${id}`, watch);
  }

  get(id) {
    return super.get(`..${ROUTE_PATH.WATCH}/${id}`);
  }

  search(query = {}) {
    return super.post(`..${ROUTE_PATH.WATCHES}`, { query });
  }

  delete(id) {
    return super.delete(`..${ROUTE_PATH.WATCH}/${id}`);
  }

  ack(watchId, actionId) {
    let url = `..${ROUTE_PATH.WATCH}/${watchId}/_ack`;
    if (actionId) {
      url += `/${actionId}`;
    }

    return super.put(url);
  }

  state(id) {
    return super.get(`..${ROUTE_PATH.WATCH}/${id}/_state`);
  }
}
