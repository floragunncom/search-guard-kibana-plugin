/* eslint-disable @kbn/eslint/require-license-header */
import {
  GLOBAL_TENANT_NAME,
  SG_GLOBAL_TENANT_NAME,
  PRIVATE_TENANT_NAME,
  SG_PRIVATE_TENANT_NAME,
} from './constants';

export function tenantNameToUiTenantName(tenantName) {
  const map = new Map([
    [, GLOBAL_TENANT_NAME],
    [SG_GLOBAL_TENANT_NAME, GLOBAL_TENANT_NAME],
    [SG_PRIVATE_TENANT_NAME, PRIVATE_TENANT_NAME],
  ]);

  return map.get(tenantName) || tenantName;
}
