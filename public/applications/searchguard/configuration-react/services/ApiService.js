/* eslint-disable @kbn/eslint/require-license-header */
import { AccessControlService } from '../../../../services';

export const API_ROOT = '../api/v1/configuration';

export class ApiService {
  constructor(httpClient, resourceName) {
    this.httpClient = httpClient;
    this.resourceName = resourceName;
    // NP TODO: pass authType
    this.accessControlService = new AccessControlService({ httpClient });
  }

  _assertResourceName() {
    if (!this.resourceName) {
      throw new Error(
        'ApiService - the class must instantiated like "new ApiService(httpClient, resourceName)" '
      );
    }
  }

  get(id) {
    this._assertResourceName();
    return this.httpClient
      .get(`${API_ROOT}/${this.resourceName}/${encodeURIComponent(id)}`)
      .then(({ data } = {}) => data);
  }

  getSilent(id) {
    this._assertResourceName();
    return this.get(encodeURIComponent(id)).catch(() => {
      // Be silent about the error
    });
  }

  async save(id, data) {
    this._assertResourceName();
    try {
      return await this.httpClient.post(
        `${API_ROOT}/${this.resourceName}/${encodeURIComponent(id)}`,
        data
      );
    } catch (error) {
      if (error.body && error.body.statusCode === 401) this.accessControlService.logout();
      throw error;
    }
  }

  async delete(id) {
    this._assertResourceName();
    try {
      return await this.httpClient.delete(
        `${API_ROOT}/${this.resourceName}/${encodeURIComponent(id)}`
      );
    } catch (error) {
      if (error.body && error.body.statusCode === 401) this.accessControlService.logout();
      throw error;
    }
  }

  list() {
    this._assertResourceName();
    return this.httpClient.get(`${API_ROOT}/${this.resourceName}`).then(({ data } = {}) => data);
  }

  listSilent() {
    return this.list();
  }

  async clearCache() {
    try {
      return await this.httpClient.delete(`${API_ROOT}/cache`);
    } catch (error) {
      if (error.body && error.body.statusCode === 401) this.accessControlService.logout();
      throw error;
    }
  }
}
