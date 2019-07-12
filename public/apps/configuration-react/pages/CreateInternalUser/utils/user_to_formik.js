import { omit } from 'lodash';
import { arrayToComboBoxOptions, attributesToUiAttributes } from '../../../utils/helpers';

const userToFormik = (user, id = '') => {
  return {
    ...omit(user, ['hash']),
    _username: id,
    _password: '',
    _backendRoles: arrayToComboBoxOptions(user.backend_roles),
    _attributes: attributesToUiAttributes(user.attributes),
    _changePassword: false
  };
};

export default userToFormik;
