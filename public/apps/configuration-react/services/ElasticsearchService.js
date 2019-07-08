import { API } from '../utils/constants';

class ElasticsearchService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  getIndices() {
    return this.httpClient.get(API.INDICES);
  }

  getIndexMappings = (index = []) => {
    return this.httpClient.post(API.INDEX_MAPPINGS, { index });
  }
}

export default ElasticsearchService;
