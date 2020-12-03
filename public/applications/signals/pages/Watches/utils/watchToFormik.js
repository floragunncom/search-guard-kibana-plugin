import { cloneDeep } from 'lodash';

export const watchToFormik = (watch, state = {}) => {
  const formik = cloneDeep(watch);
  if (!formik._ui) {
    formik._ui = {};
  }
  formik._ui.state = state;
  return formik;
};
