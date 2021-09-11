/* eslint-disable @osd/eslint/require-license-header */
import { getSideNavItems } from './get_side_nav_items';

describe('public/configuration/pages/auth/get_side_nav_items', () => {
  it('can build left EuiSideNav meta data', () => {
    const selectedSideNavItemName = 'basicInternalAuthDomain';
    const mockOnSelectSideNavItem = jest.fn();
    const renderItem = () => null;

    const resources = {
      jwtAuthDomain: {
        order: 0,
        name: 'jwtAuthDomain',
        resourceType: 'authc',
      },
      basicInternalAuthDomain: {
        order: 4,
        name: 'basicInternalAuthDomain',
        resourceType: 'authc',
      },
      proxyAuthDomain: {
        order: 3,
        name: 'proxyAuthDomain',
        resourceType: 'authc',
      },
      clientcertAuthDomain: {
        order: 2,
        name: 'clientcertAuthDomain',
        resourceType: 'authc',
      },
      ldapXyz: {
        order: 5,
        name: 'ldapXyz',
        resourceType: 'authc',
      },
      kerberosAuthDomain: {
        order: 6,
        name: 'kerberosAuthDomain',
        resourceType: 'authc',
      },
      rolesFromAnotherLdap: {
        name: 'rolesFromAnotherLdap',
        resourceType: 'authz',
      },
      rolesFromMyldap: {
        name: 'rolesFromMyldap',
        resourceType: 'authz',
      },
    };

    const result = getSideNavItems({
      selectedSideNavItemName,
      resources,
      onSelectSideNavItem: mockOnSelectSideNavItem,
    });

    expect(JSON.stringify(result)).toBe(
      JSON.stringify([
        {
          items: [
            { order: 0, id: 'jwtAuthDomain', renderItem },
            { order: 2, id: 'clientcertAuthDomain', renderItem },
            { order: 3, id: 'proxyAuthDomain', renderItem },
            { order: 4, id: 'basicInternalAuthDomain', renderItem },
            { order: 5, id: 'ldapXyz', renderItem },
            { order: 6, id: 'kerberosAuthDomain', renderItem },
          ],
          id: 'authentication',
          renderItem,
        },
        {
          items: [
            { order: 1, id: 'rolesFromAnotherLdap', renderItem },
            { order: 2, id: 'rolesFromMyldap', renderItem },
          ],
          id: 'authorization',
          renderItem,
        },
      ])
    );
  });
});
