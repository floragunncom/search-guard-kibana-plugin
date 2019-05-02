import { omit } from 'lodash';

const formikToUser = userFormik => {
  const user = {
    ...omit(userFormik, ['username', 'passwordConfirmation', 'changePassword']),
    roles: userFormik.roles.map(({ label }) => label),
    attributes: userFormik.attributes.reduce((result, { key, value }) => {
      result[key] = value;
      return result;
    }, {})
  };

  // The logic below is from the old app.
  if (user.hidden === false) delete user.hidden;
  if (user.readonly === false) delete user.readonly;

  return user;
};

export default formikToUser;
