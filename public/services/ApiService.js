/* eslint-disable @kbn/eslint/require-license-header */
import { API_ROOT } from '../utils/constants';

export class ApiService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  loadRestInfo = () => {
    return this.httpClient.get(`${API_ROOT}/restapiinfo`).then(({ data }) => data);
  };

  loadSystemInfo = () => {
    return this.httpClient.get(`${API_ROOT}/systeminfo`).then(({ data }) => data);
  };

  loadAuthInfo = () => {
    return this.httpClient.get(`${API_ROOT}/auth/authinfo`).then(({ data }) => data);
  };

  loadKibanaConfig = () => {
    return this.httpClient.get(`${API_ROOT}/searchguard/kibana_config`).then(({ data }) => data);
  };
}
