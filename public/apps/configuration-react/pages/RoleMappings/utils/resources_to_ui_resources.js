import { map, sortBy } from 'lodash';

const resourcesToUiResources = actionGroups => {
  return sortBy(map(actionGroups, (values, name) => ({ _id: name, ...values })), '_id');
};

export default resourcesToUiResources;
