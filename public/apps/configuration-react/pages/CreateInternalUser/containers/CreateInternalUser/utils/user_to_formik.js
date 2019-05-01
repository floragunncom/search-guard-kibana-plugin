import { map } from 'lodash';

const userToFormik = userDoc => ({
  ...userDoc,
  roles: map(userDoc.roles, label => ({ label })),
  attributes: map(userDoc.attributes, (value, key) => ({ value, key }))
});

export default userToFormik;
