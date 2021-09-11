/* eslint-disable @osd/eslint/require-license-header */
import { ApiService } from './ApiService';

const RESOURCE = 'actiongroups';

export class ActionGroupsService extends ApiService {
  constructor(httpClient) {
    super(httpClient, RESOURCE);
  }

  // TODO: check if we still need this
  _cleanSessionStorage() {
    sessionStorage.removeItem('actiongroupsautocomplete');
    sessionStorage.removeItem('actiongroupnames');
  }

  save(id, data) {
    this._cleanSessionStorage();
    return super.save(id, data);
  }

  delete(id) {
    this._cleanSessionStorage();
    return super.delete(id);
  }
}
