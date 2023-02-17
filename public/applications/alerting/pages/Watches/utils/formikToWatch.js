import { cloneDeep } from 'lodash';

// TODO: add test
export const formikToWatch = (formik) => {
  const watch = cloneDeep(formik);
  if (watch._ui) {
    delete watch._ui.state;
  }
  return watch;
};
