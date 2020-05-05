/* eslint-disable @kbn/eslint/require-license-header */
import { ApiService } from './ApiService';

const RESOURCE = 'tenants';

export class TenantsService extends ApiService {
  constructor(httpClient) {
    super(httpClient, RESOURCE);
  }
}
