import { map } from 'lodash';

const userToFormik = userDoc => ({
  ...userDoc,
  roles: map(userDoc.roles, value => ({ value })),
  attributes: map(userDoc.attributes, (value, key) => ({ value, key }))
});

export default userToFormik;
