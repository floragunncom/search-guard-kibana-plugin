import { formikToWatch } from './formikToWatch';

describe('formikToWatch', () => {
  test('can remove state from _ui meta', () => {
    const watch = { a: 1, _ui: {} };
    const formik = { a: 1, _ui: { state: { b: 2 } } };

    expect(formikToWatch(formik)).toEqual(watch);
  });
});
