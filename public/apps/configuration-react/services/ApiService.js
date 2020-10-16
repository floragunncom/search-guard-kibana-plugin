/* eslint-disable @kbn/eslint/require-license-header */
import { AccessControlService } from '../../../services';

export const API_ROOT = '../api/v1/configuration';

export class ApiService {
  constructor(httpClient, resourceName) {
    this.httpClient = httpClient;
    this.resourceName = resourceName;
    this.accessControlService = new AccessControlService(httpClient);
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
      .get(`${API_ROOT}/${this.resourceName}/${id}`)
      .then(({ data } = {}) => data);
  }

  getSilent(id) {
    this._assertResourceName();
    return this.get(id).catch(() => {
      // Be silent about the error
    });
  }

  async save(id, data) {
    this._assertResourceName();
    try {
      return await this.httpClient.post(`${API_ROOT}/${this.resourceName}/${id}`, data);
    } catch (error) {
      if (error.status === 403) {
        console.error('save', error);
        this.accessControlService.logout();
      } else {
        throw error;
      }
    }
  }

  delete(id) {
    this._assertResourceName();
    try {
      return this.httpClient.delete(`${API_ROOT}/${this.resourceName}/${id}`);
    } catch (error) {
      if (error.status === 403) {
        console.error('delete', error);
        this.accessControlService.logout();
      } else {
        throw error;
      }
    }
  }

  list() {
    this._assertResourceName();
    return this.httpClient.get(`${API_ROOT}/${this.resourceName}`).then(({ data } = {}) => data);
  }

  listSilent() {
    return this.list();
  }

  clearCache() {
    try {
      return this.httpClient.delete(`${API_ROOT}/cache`);
    } catch (error) {
      if (error.status === 403) {
        console.error('clearCache', error);
        this.accessControlService.logout();
      } else {
        throw error;
      }
    }
  }
}
