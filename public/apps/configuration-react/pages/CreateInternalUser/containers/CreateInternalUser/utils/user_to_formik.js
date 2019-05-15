import { map, omit } from 'lodash';
import { DEFAULT_USER } from './constants';

const userToFormik = (user, id = '') => ({
  ...omit(user, ['hash']),
  ...DEFAULT_USER,
  username: id,
  backend_roles: map(user.backend_roles, label => ({ label })),
  attributes: map(user.attributes, (value, key) => ({ value, key }))
});

export default userToFormik;
