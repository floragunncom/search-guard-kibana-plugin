import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class AccountsService extends SignalsService {
  constructor(httpClient, type) {
    super(httpClient);
    this.type = type;
  }

  put(account, id, type = this.type) {
    return super.put(`..${ROUTE_PATH.ACCOUNT}/${type}/${id}`, account);
  }

  get(id, type = this.type) {
    return super.get(`..${ROUTE_PATH.ACCOUNT}/${type}/${id}`);
  }

  search(query = {}) {
    return super.post(`..${ROUTE_PATH.ACCOUNTS}`, { query });
  }

  delete(id, type = this.type) {
    return super.delete(`..${ROUTE_PATH.ACCOUNT}/${type}/${id}`);
  }
}
