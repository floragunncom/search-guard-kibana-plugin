import { omit } from 'lodash';
import { DEFAULT_PASSWORD } from '../../../../../utils/constants';

const tableUserToUser = user => ({
  ...omit(user, ['id', 'hidden', 'readonly']),
  password: DEFAULT_PASSWORD // API prohibits saving user with empty password
});

export default tableUserToUser;
