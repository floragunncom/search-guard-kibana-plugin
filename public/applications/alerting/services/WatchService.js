import AlertingService from './AlertingService';
import { ROUTE_PATH } from '../utils/constants';

export default class WatchService extends AlertingService {
  execute({ watch, simulate = false, skipActions = true } = {}) {
    return this.httpClient
      .post(`..${ROUTE_PATH.WATCH_EXECUTE}`, {
        watch,
        simulate,
        skipActions,
      })
      .then(({ data }) => data);
  }

  executeESRequest(request) {
    return super.post(`..${ROUTE_PATH.WATCH_EXECUTE_GRAPH}`, { request });
  }

  put(watch, id) {
    return super.put(`..${ROUTE_PATH.WATCH}/${encodeURIComponent(id)}`, watch);
  }

  get(id) {
    return super.get(`..${ROUTE_PATH.WATCH}/${encodeURIComponent(id)}`);
  }

  search(query = {}) {
    return super.post(`..${ROUTE_PATH.WATCHES}`, { query });
  }

  delete(id) {
    return super.delete(`..${ROUTE_PATH.WATCH}/${encodeURIComponent(id)}`);
  }

  ack(watchId, actionId) {
    let url = `..${ROUTE_PATH.WATCH}/${encodeURIComponent(watchId)}/_ack`;
    if (actionId) {
      url += `/${actionId}`;
    }

    return super.put(url);
  }

  state(id) {
    return super.get(`..${ROUTE_PATH.WATCH}/${encodeURIComponent(id)}/_state`);
  }
}
