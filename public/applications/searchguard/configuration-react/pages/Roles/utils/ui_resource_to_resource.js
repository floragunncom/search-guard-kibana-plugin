import { omit } from 'lodash';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const uiResourceToResource = resource => {
  return {
    ...omit(resource, [
      '_tenantPatterns',
      '_indexPatterns',
      '_id',
      ...FIELDS_TO_OMIT_BEFORE_SAVE
    ])
  };
};

export default uiResourceToResource;
