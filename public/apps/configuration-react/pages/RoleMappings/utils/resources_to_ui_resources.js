import { map, sortBy } from 'lodash';

const resourcesToUiResources = (roleMappings, allRoles = {}) => {
  return sortBy(map(roleMappings, (values, name) => ({
    _id: name,
    _isCorrespondingRole: !!allRoles[name],
    ...values
  })), '_id');
};

export default resourcesToUiResources;
