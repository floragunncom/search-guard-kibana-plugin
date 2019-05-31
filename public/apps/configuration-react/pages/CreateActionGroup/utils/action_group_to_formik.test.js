import { actionGroupsToUiActionGroups, actionGroupToFormik } from './action_group_to_formik';

describe('axction group to UI action group', () => {
  test('can build UI action groups', () => {
    const resource = {
      'B': {},
      'A': {},
      'C': {}
    };

    const uiResource = [
      { label: 'B' },
      { label: 'C' }
    ];

    expect(actionGroupsToUiActionGroups(resource, ['A'])).toEqual(uiResource);
  });

  test('can build UI action group', () => {
    const resource = {
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
      static: false
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

    expect(actionGroupToFormik(resource, uiResource._name)).toEqual(uiResource);
  });
});
