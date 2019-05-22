import { cloneDeep, omit, map, sortBy } from 'lodash';
import { allowedActionsToPermissionsAndActiongroups } from '../../../utils/helpers';

export const resourcesToUiResources = actionGroups => {
  return sortBy(map(cloneDeep(actionGroups), (values, name) => {
    const { actiongroups, permissions } = allowedActionsToPermissionsAndActiongroups(values.allowed_actions);
    return {
      _id: name,
      actiongroups,
      permissions,
      ...omit(values, ['allowed_actions'])
    };
  }), '_id');
};
