import { omit } from 'lodash';
import { DEFAULT_PASSWORD } from '../../../../../utils/constants';

const uiResourceToResource = user => ({
  ...omit(user, ['_id', 'hidden', 'reserved', 'static']),
  password: DEFAULT_PASSWORD // API prohibits saving user with empty password
});

export default uiResourceToResource;
