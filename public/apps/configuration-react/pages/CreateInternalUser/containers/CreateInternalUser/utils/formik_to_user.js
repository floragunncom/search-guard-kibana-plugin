import { omit } from 'lodash';

const formikToUser = userFormik => ({
  ...omit(userFormik, ['showJson', 'passwordRepeat', 'changePassword']),
  roles: userFormik.roles.map(({ label }) => label),
  attributes: userFormik.attributes.reduce((result, { key, value }) => {
    result[key] = value;
    return result;
  }, {})
});

export default formikToUser;
