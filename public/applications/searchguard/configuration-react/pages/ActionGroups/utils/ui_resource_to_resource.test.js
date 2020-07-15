import uiResourceToResource from './ui_resource_to_resource';

describe('UI table action group to action group', () => {
  test('can build action group', () => {
    const uiResource = {
      _id: 'A_ACTION_GROUP',
      _actiongroups: [ 'C' ],
      _permissions: [
        'kibana:a/b/c/d'
      ],
      reserved: false,
      hidden: false,
      allowed_actions: [
        'indices:a/b/c',
        'kibana:a/b/c',
        'cluster:a/b/c',
        'B',
        'A',
      ],
      type: 'kibana',
      static: false
    };

    const resource = {
      allowed_actions: [
        'kibana:a/b/c/d',
        'C'
      ],
      type: uiResource.type
    };

    expect(uiResourceToResource(uiResource)).toEqual(resource);
  });
});
