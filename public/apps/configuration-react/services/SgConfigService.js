/* eslint-disable @kbn/eslint/require-license-header */
import { API_ROOT } from './ApiService';

const RESOURCE = 'sgconfig';

export class SgConfigService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  list() {
    return this.httpClient.get(`${API_ROOT}/${RESOURCE}`).then(({ data } = {}) => data);
  }

  listSilent() {
    return this.list();
  }
}
