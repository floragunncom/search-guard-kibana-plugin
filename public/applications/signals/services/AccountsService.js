import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class AccountsService extends SignalsService {
  constructor(httpClient, type, tenantScoped = false) {
    super(httpClient);
    this.type = type;
    this.tenantScoped = tenantScoped;
  }

  put(account, id, type = this.type) {
    const routePath = this.tenantScoped ? ROUTE_PATH.TENANT_ACCOUNT : ROUTE_PATH.ACCOUNT;
    return super.put(`..${routePath}/${type}/${encodeURIComponent(id)}`, account);
  }

  get(id, type = this.type) {
    const routePath = this.tenantScoped ? ROUTE_PATH.TENANT_ACCOUNT : ROUTE_PATH.ACCOUNT;
    return super.get(`..${routePath}/${type}/${encodeURIComponent(id)}`);
  }

  search(query = {}) {
    const routePath = this.tenantScoped ? ROUTE_PATH.TENANT_ACCOUNTS : ROUTE_PATH.ACCOUNTS;
    return super.post(`..${routePath}`, { query });
  }

  delete(id, type = this.type) {
    const routePath = this.tenantScoped ? ROUTE_PATH.TENANT_ACCOUNT : ROUTE_PATH.ACCOUNT;
    return super.delete(`..${routePath}/${type}/${encodeURIComponent(id)}`);
  }
}
