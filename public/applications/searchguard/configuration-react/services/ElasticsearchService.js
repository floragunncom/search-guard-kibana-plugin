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

  getDataStreams(dataStream = []) {
    return this.httpClient.post(API.DATA_STREAMS, { dataStream });
  }

  getIndexMappings = (index = []) => {
    return this.httpClient.post(API.INDEX_MAPPINGS, { index });
  }
}

export default ElasticsearchService;
