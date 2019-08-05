import formikToTenant from './formik_to_tenant';

describe('UI tenant to tenant', () => {
  test('can build tenant', () => {
    const resource = {
      description: 'administrator'
    };

    const uiResource = {
      _name: 'trex',
      description: 'administrator',
      static: false,
      reserved: false,
      hidden: false
    };

    expect(formikToTenant(uiResource)).toEqual(resource);
  });
});
