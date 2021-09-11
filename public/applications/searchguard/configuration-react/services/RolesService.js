/* eslint-disable @osd/eslint/require-license-header */
import { ApiService } from './ApiService';

const RESOURCE = 'roles';

export class RolesService extends ApiService {
  constructor(httpClient) {
    super(httpClient, RESOURCE);
  }
}
