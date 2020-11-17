/* eslint-disable @kbn/eslint/require-license-header */
import { tenantNameToUiTenantName } from './tenant_name_to_ui_tenant_name';
import {
  GLOBAL_TENANT_NAME,
  SG_GLOBAL_TENANT_NAME,
  PRIVATE_TENANT_NAME,
  SG_PRIVATE_TENANT_NAME,
} from './constants';

describe('tenantNameToUiTenantName', () => {
  test('can map SG backend tenant name to UI tenant name', () => {
    expect(tenantNameToUiTenantName('user')).toBe('user');
    expect(tenantNameToUiTenantName()).toBe(GLOBAL_TENANT_NAME);
    expect(tenantNameToUiTenantName(SG_GLOBAL_TENANT_NAME)).toBe(GLOBAL_TENANT_NAME);
    expect(tenantNameToUiTenantName(SG_PRIVATE_TENANT_NAME)).toBe(PRIVATE_TENANT_NAME);
  });
});
