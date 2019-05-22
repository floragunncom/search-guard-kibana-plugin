import { omit } from 'lodash';
import { uiAttributesToAttributes, comboBoxOptionsToArray } from '../../../../../utils/helpers';

const formikToUser = userFormik => {
  const user = {
    ...omit(userFormik, [
      '_username',
      '_passwordConfirmation',
      '_changePassword',
      '_backendRoles',
      '_attributes',
      'static']
    ),
    backend_roles: comboBoxOptionsToArray(userFormik._backendRoles),
    attributes: uiAttributesToAttributes(userFormik._attributes)
  };

  // The logic below is from the old app.
  if (user.hidden === false) delete user.hidden;
  if (user.reserved === false) delete user.reserved;

  return user;
};

export default formikToUser;
