import { cloneDeep, sortBy, filter } from 'lodash';
import {
  arrayToComboBoxOptions,
  allowedActionsToPermissionsAndActiongroups
} from '../../../utils/helpers';

export const actionGroupsToUiActionGroups = (actionGroups = {}, groupNamesToFilter = []) => {
  return arrayToComboBoxOptions(filter(sortBy(Object.keys(actionGroups)), groupName => {
    return !groupNamesToFilter.includes(groupName);
  }));
};

export const actionGroupToFormik = (actionGroup, id = '') => {
  const { allowed_actions: allowedActions } = cloneDeep(actionGroup);
  const { permissions, actiongroups } = allowedActionsToPermissionsAndActiongroups(allowedActions);
  return {
    ...actionGroup,
    _name: id,
    _isAdvanced: true,
    _permissions: arrayToComboBoxOptions(sortBy(permissions)),
    _actiongroups: arrayToComboBoxOptions(sortBy(actiongroups))
  };
};
