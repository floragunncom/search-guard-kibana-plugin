import { map, sortBy } from 'lodash';

export const resourcesToUiResources = actionGroups => {
  return sortBy(map(actionGroups, (values, name) => ({ _id: name, ...values })), '_id');
};
