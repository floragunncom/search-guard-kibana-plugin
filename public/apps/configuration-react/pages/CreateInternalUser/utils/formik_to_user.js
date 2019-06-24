import { omit } from 'lodash';
import { uiAttributesToAttributes, comboBoxOptionsToArray } from '../../../utils/helpers';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const formikToUser = userFormik => {
  const user = {
    ...omit(userFormik, [
      '_username',
      '_password',
      '_passwordConfirmation',
      '_changePassword',
      '_backendRoles',
      '_attributes',
      ...FIELDS_TO_OMIT_BEFORE_SAVE
    ]),
    backend_roles: comboBoxOptionsToArray(userFormik._backendRoles),
    attributes: uiAttributesToAttributes(userFormik._attributes)
  };

  if (userFormik._password) {
    user.password = userFormik._password;
  }

  // The logic below is from the old app.
  if (user.hidden === false) delete user.hidden;
  if (user.reserved === false) delete user.reserved;

  return user;
};

export default formikToUser;
