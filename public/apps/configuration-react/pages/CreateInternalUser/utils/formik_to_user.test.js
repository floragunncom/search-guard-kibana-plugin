import formikToUser from './formik_to_user';

describe('UI user to user', () => {
  test('can build user', () => {
    const resource = {
      password: 'abcde',
      backend_roles: ['a', 'b'],
      attributes: {
        'a': 'b',
        'c': 'd'
      },
      description: 'Migrated from v6',
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
      _password: 'abcde',
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

    expect(formikToUser(uiResource)).toEqual(resource);
  });
});
