import {
  internalUsersToUiBackendRoles,
  isSinglePermission,
  arrayToComboBoxOptions,
  comboBoxOptionsToArray,
  attributesToUiAttributes,
  uiAttributesToAttributes,
  filterReservedStaticTableResources,
  allowedActionsToPermissionsAndActiongroups
} from './index';

describe('common helpers', () => {
  test('can build UI backend roles from internal users', () => {
    const internalUsers = {
      user_a: {
        backend_roles: ['b', 'a']
      },
      user_b: {
        backend_roles: ['a', 'c']
      }
    };

    const backendRoles = [
      { label: 'a' },
      { label: 'b' },
      { label: 'c' }
    ];

    expect(internalUsersToUiBackendRoles(internalUsers)).toEqual(backendRoles);
  });

  test('can verify if single permission', () => {
    expect(isSinglePermission('cluster:/a/b/c')).toBe(true);
    expect(isSinglePermission('kibana:/a/b/c')).toBe(true);
    expect(isSinglePermission('indices:/a/b/c')).toBe(true);
    expect(isSinglePermission('index:/a/b/c')).toBe(false);
    expect(isSinglePermission('CLUSTER:/a/b/c')).toBe(false);
    expect(isSinglePermission('KIBANA:/a/b/c')).toBe(false);
  });

  test('can build ComboBox options from array', () => {
    const array = ['b', 'a'];

    const comboBoxOptions = [
      { label: 'a' },
      { label: 'b' }
    ];

    expect(arrayToComboBoxOptions(array)).toEqual(comboBoxOptions);
  });

  test('can build array from ComboBox options', () => {
    const array = ['a', 'b'];

    const comboBoxOptions = [
      { label: 'b' },
      { label: 'a' }
    ];

    expect(comboBoxOptionsToArray(comboBoxOptions)).toEqual(array);
  });

  test('can build UI attributes', () => {
    const attributes = {
      a: 'b',
      c: 'd'
    };

    const uiAttributes = [
      { key: 'a', value: 'b' },
      { key: 'c', value: 'd' }
    ];

    expect(attributesToUiAttributes(attributes)).toEqual(uiAttributes);
  });

  test('can build attributes from UI attributes', () => {
    const attributes = {
      a: 'b',
      c: 'd'
    };

    const uiAttributes = [
      { key: 'a', value: 'b' },
      { key: 'c', value: 'd' },
      { key: ' ', value: 'f' }
    ];

    expect(uiAttributesToAttributes(uiAttributes)).toEqual(attributes);
  });

  test('can filter reserved and static resources', () => {
    const resources = [
      { a: 1, static: true },
      { b: 2, reserved: true },
      { c: 3 }
    ];

    let isShowingSystemItems = false;
    expect(filterReservedStaticTableResources(resources, isShowingSystemItems)).toEqual([{ c: 3 }]);
    isShowingSystemItems = true;
    expect(filterReservedStaticTableResources(resources, isShowingSystemItems)).toEqual(resources);
  });

  test('can crete actiongroups and permissions from allowed_action', () => {
    const allowedActions = [ 'indices:a', 'cluster:a/b', 'kibana:v', 'B', 'A' ];
    const result = {
      actiongroups: ['A', 'B'],
      permissions: ['cluster:a/b', 'indices:a', 'kibana:v']
    };

    expect(allowedActionsToPermissionsAndActiongroups(allowedActions)).toEqual(result);
  });
});
