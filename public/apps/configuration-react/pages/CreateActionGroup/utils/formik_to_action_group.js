import { cloneDeep } from 'lodash';
import { comboBoxOptionsToArray } from '../../../utils/helpers';

const formikToActionGroup = _formik => {
  const formik = cloneDeep(_formik);
  const { _permissions, _actiongroups, type } = formik;
  return {
    type,
    allowed_actions: [...comboBoxOptionsToArray(_permissions), ...comboBoxOptionsToArray(_actiongroups)]
  };
};

export default formikToActionGroup;
