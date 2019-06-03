import { map, sortBy } from 'lodash';

const resourcesToUiResources = (roleMappings, correspondingRoles = {}) => {
  return sortBy(map(roleMappings, (values, name) => ({
    _id: name,
    _isCorrespondingRole: !!correspondingRoles[name],
    ...values
  })), '_id');
};

export default resourcesToUiResources;
