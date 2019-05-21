import { omit } from 'lodash';
import { arrayToComboBoxOptions, attributesToUiAttributes } from '../../../../../utils/helpers';

export const backendRolesToUiBackendRoles = backendRoles => arrayToComboBoxOptions(Object.keys(backendRoles));

export const userToFormik = (user, id = '') => {
  return {
    ...omit(user, ['hash']),
    _username: id,
    _backendRoles: arrayToComboBoxOptions(user.backend_roles),
    _attributes: attributesToUiAttributes(user.attributes)
  };
};
