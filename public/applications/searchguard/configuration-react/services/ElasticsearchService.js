/* eslint-disable @kbn/eslint/require-license-header */
import { API } from '../utils/constants';

class ElasticsearchService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  getIndices(index = []) {
    return this.httpClient.post(API.INDICES, { index });
  }

  getAliases(alias = []) {
    return this.httpClient.post(API.ALIASES, { alias });
  }

  getIndexMappings = (index = []) => {
    return this.httpClient.post(API.INDEX_MAPPINGS, { index });
  };
}

export default ElasticsearchService;
