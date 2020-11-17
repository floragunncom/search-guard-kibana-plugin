import tenantToFormik from './tenant_to_formik';

describe('tenant to UI tenant', () => {
  test('can build UI tenant', () => {
    const resource = {
      descrtiption: 'administrator',
      static: false,
      reserved: false,
      hidden: false
    };

    const uiResource = {
      _name: 'trex',
      descrtiption: 'administrator',
      static: false,
      reserved: false,
      hidden: false
    };

    expect(tenantToFormik(resource, uiResource._name)).toEqual(uiResource);
  });
});
