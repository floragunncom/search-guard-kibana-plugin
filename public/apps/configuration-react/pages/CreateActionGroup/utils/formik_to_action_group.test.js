import formikToActionGroup from './formik_to_action_group';

describe('UI action group to action group', () => {
  test('can build action group', () => {
    const resource = {
      allowed_actions: [
        'cluster:a/b/c',
        'indices:a/b/c',
        'kibana:a/b/c',
        'A',
        'B'
      ],
      type: 'cluster'
    };

    const uiResource = {
      allowed_actions: [
        'kibana:a/b/c',
        'cluster:a/b/c',
        'indices:a/b/c',
        'B',
        'A'
      ],
      type: 'cluster',
      hidden: false,
      reserved: false,
      static: false,
      _isAdvanced: false,
      _name: 'A_GROUP',
      _permissions: [
        { label: 'cluster:a/b/c' },
        { label: 'indices:a/b/c' },
        { label: 'kibana:a/b/c' }
      ],
      _actiongroups: [
        { label: 'A' },
        { label: 'B' }
      ]
    };

    expect(formikToActionGroup(uiResource)).toEqual(resource);
  });
});
