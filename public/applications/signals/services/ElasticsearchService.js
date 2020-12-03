import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class ElasticsearchService extends SignalsService {
  search({ index, body, size }) {
    return super.post(`..${ROUTE_PATH.SEARCH}`, { index, body, size });
  }

  getMappings(index) {
    return super.post(`..${ROUTE_PATH.MAPPINGS}`, { index });
  }

  getIndices(index) {
    return super.post(`..${ROUTE_PATH.INDICES}`, { index });
  }

  getAliases(alias) {
    return super.post(`..${ROUTE_PATH.ALIASES}`, { alias });
  }
}
