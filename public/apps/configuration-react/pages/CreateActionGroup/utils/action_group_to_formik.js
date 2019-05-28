import { omit, cloneDeep, sortBy, filter } from 'lodash';
import {
  arrayToComboBoxOptions,
  actionGroupToActiongroupsAndPermissions
} from '../../../utils/helpers';

export const actionGroupsToUiActionGroups = (actionGroups = {}, groupNamesToFilter = []) => {
  return arrayToComboBoxOptions(filter(sortBy(Object.keys(actionGroups)), groupName => {
    return !groupNamesToFilter.includes(groupName);
  }));
};

export const actionGroupToFormik = (_actionGroup, id = '') => {
  const actionGroup = cloneDeep(_actionGroup);
  const { permissions, actiongroups } = actionGroupToActiongroupsAndPermissions(actionGroup);
  return {
    _name: id,
    _isAdvanced: false,
    _permissions: arrayToComboBoxOptions(sortBy(permissions)),
    _actiongroups: arrayToComboBoxOptions(sortBy(actiongroups)),
    ...omit(actionGroup, 'allowed_actions')
  };
};
