import userToFormik from './user_to_formik';

describe('user to UI user', () => {
  test('can build UI user', () => {
    const resource = {
      hash: '',
      reserved: false,
      hidden: false,
      backend_roles: ['b', 'a'],
      attributes: {
        'a': 'b',
        'c': 'd'
      },
      description: 'Migrated from v6',
      static: false
    };

    const uiResource = {
      reserved: false,
      hidden: false,
      backend_roles: ['b', 'a'],
      attributes: {
        'a': 'b',
        'c': 'd'
      },
      description: 'Migrated from v6',
      static: false,
      _username: 'admin',
      _password: '',
      _backendRoles: [
        { label: 'a' },
        { label: 'b' }
      ],
      _attributes: [
        {
          key: 'a',
          value: 'b'
        },
        {
          key: 'c',
          value: 'd'
        }
      ]
    };

    expect(userToFormik(resource, uiResource._username)).toEqual(uiResource);
  });
});
