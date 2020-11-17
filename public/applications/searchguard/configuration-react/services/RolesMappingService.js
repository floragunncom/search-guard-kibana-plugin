/* eslint-disable @kbn/eslint/require-license-header */
import { ApiService } from './ApiService';

const RESOURCE = 'rolesmapping';

export class RolesMappingService extends ApiService {
  constructor(httpClient) {
    super(httpClient, RESOURCE);
  }
}
