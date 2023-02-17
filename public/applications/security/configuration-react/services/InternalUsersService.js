/* eslint-disable @osd/eslint/require-license-header */
import { ApiService } from './ApiService';

const RESOURCE = 'internalusers';

export class InternalUsersService extends ApiService {
  constructor(httpClient) {
    super(httpClient, RESOURCE);
  }
}
