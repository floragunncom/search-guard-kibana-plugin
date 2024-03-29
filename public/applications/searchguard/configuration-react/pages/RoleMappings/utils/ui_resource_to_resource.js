import { omit } from 'lodash';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const uiResourceToResource = resource =>
  omit(resource, ['_id', '_isCorrespondingRole', 'and_backend_roles', ...FIELDS_TO_OMIT_BEFORE_SAVE]);

export default uiResourceToResource;
