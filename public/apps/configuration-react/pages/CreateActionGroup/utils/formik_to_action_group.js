import { cloneDeep } from 'lodash';
import { comboBoxOptionsToArray } from '../../../utils/helpers';

const formikToActionGroup = _formik => {
  const formik = cloneDeep(_formik);
  const { _permissions, _actiongroups } = formik;
  return {
    permissions: comboBoxOptionsToArray(_permissions),
    actiongroups: comboBoxOptionsToArray(_actiongroups)
  };
};
export default formikToActionGroup;
