import resourcesToUiResources from './resources_to_ui_resources';

describe('tenants to UI table tenants', () => {
  test('can build UI table tenants', () => {
    const resources = {
      b: {
        description: 'B',
        hidden: false,
        reserved: false,
        static: false
      },
      a: {
        description: 'A',
        hidden: false,
        reserved: false,
        static: false
      }
    };

    const uiResources = [
      {
        _id: 'a',
        description: 'A',
        hidden: false,
        reserved: false,
        static: false
      },
      {
        _id: 'b',
        description: 'B',
        hidden: false,
        reserved: false,
        static: false
      }
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
