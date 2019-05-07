import { omit } from 'lodash';

const formikToUser = userFormik => {
  const user = {
    ...omit(userFormik, ['username', 'passwordConfirmation', 'changePassword', 'static']),
    backend_roles: userFormik.backend_roles.map(({ label }) => label),
    attributes: userFormik.attributes.reduce((result, { key, value }) => {
      result[key] = value;
      return result;
    }, {})
  };

  // The logic below is from the old app.
  if (user.hidden === false) delete user.hidden;
  if (user.reserved === false) delete user.reserved;

  return user;
};

export default formikToUser;
