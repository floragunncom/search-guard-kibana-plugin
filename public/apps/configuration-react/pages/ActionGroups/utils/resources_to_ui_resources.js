import { cloneDeep, map, sortBy } from 'lodash';
import { allowedActionsToPermissionsAndActiongroups } from '../../../utils/helpers';

export const resourcesToUiResources = actionGroups => {
  return sortBy(map(cloneDeep(actionGroups), (values, name) => {
    const {
      actiongroups: _actiongroups,
      permissions: _permissions
    } = allowedActionsToPermissionsAndActiongroups(values.allowed_actions);
    return {
      ...values,
      _id: name,
      _actiongroups,
      _permissions
    };
  }), '_id');
};
