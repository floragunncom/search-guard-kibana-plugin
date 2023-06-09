import resourcesToUiResources from './resources_to_ui_resources';

describe('action groups to UI table action groups', () => {
  test('can build UI table action groups', () => {
    const resources = {
      B_ACTION_GROUP: {
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
      },
      A_ACTION_GROUP: {
        reserved: true,
        hidden: false,
        allowed_actions: [
          'indices:a/b/c',
          'kibana:a/b/c',
          'cluster:a/b/c',
          'B',
          'A',
        ],
        type: 'index',
        description: 'Statically defined',
        static: true
      }
    };

    const uiResources = [
      {
        _id: 'A_ACTION_GROUP',
        _actiongroups: [ 'A', 'B' ],
        _permissions: [
          'cluster:a/b/c',
          'indices:a/b/c',
          'kibana:a/b/c'
        ],
        reserved: true,
        hidden: false,
        allowed_actions: [
          'indices:a/b/c',
          'kibana:a/b/c',
          'cluster:a/b/c',
          'B',
          'A',
        ],
        type: 'index',
        description: 'Statically defined',
        static: true
      },
      {
        _id: 'B_ACTION_GROUP',
        _actiongroups: [ 'A', 'B' ],
        _permissions: [
          'cluster:a/b/c',
          'indices:a/b/c',
          'kibana:a/b/c'
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
      }
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
