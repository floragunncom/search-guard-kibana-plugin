import { omit } from 'lodash';
import { DEFAULT_PASSWORD, FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const uiResourceToResource = user => ({
  password: DEFAULT_PASSWORD, // API prohibits saving user with empty password
  ...omit(user, ['_id', ...FIELDS_TO_OMIT_BEFORE_SAVE])
});

export default uiResourceToResource;
