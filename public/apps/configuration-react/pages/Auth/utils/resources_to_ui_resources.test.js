import resourcesToUiResources from './resources_to_ui_resources';

describe('auth data to UI auth', () => {
  test('can build UI auth', () => {
    const resources = {
      authc: {
        a_b: { e: 'f' },
      },
      authz: {
        c_d: { g: 'j' }
      }
    };

    const uiResources = {
      aB: {
        name: 'aB',
        resourceType: 'authc',
        e: 'f'
      },
      cD: {
        name: 'cD',
        resourceType: 'authz',
        g: 'j'
      }
    };

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
