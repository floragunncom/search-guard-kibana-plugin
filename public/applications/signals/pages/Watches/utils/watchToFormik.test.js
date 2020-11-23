import { watchToFormik } from './watchToFormik';

describe('watchToFormik', () => {
  test('can put state in _ui meta', () => {
    const watch = { a: 1 };
    const state = { b: 2 };
    const formik = { a: 1, _ui: { state: { b: 2 } } };

    expect(watchToFormik(watch, state)).toEqual(formik);
  });
});
