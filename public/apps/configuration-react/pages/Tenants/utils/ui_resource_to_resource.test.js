import uiResourceToResource from './ui_resource_to_resource';

describe('UI table tenant to tenant', () => {
  test('can build tenant', () => {
    const uiResource = {
      _id: 'a',
      description: 'A',
      hidden: false,
      reserved: false,
      static: false
    };

    const resource = {
      description: 'A'
    };

    expect(uiResourceToResource(uiResource)).toEqual(resource);
  });
});
