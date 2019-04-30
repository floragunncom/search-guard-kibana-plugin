import { omit } from 'lodash';

const formikToUser = userFormik => ({
  ...omit(userFormik, ['showJson']),
  roles: userFormik.roles.map(({ value }) => value),
  attributes: userFormik.attributes.reduce((result, { key, value }) => {
    result[key] = value;
    return result;
  }, {})
});

export default formikToUser;
