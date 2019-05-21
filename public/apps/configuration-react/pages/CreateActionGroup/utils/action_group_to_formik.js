import { omit, cloneDeep, sortBy } from 'lodash';
import {
  actionGroupsToActiongroupsAndPermissions,
  arrayToComboBoxOptions,
  actionGroupToActiongroupsAndPermissions
} from '../../../utils/helpers';

export const actionGroupsToUiActionGroups = (actionGroups = {}, currentId) => {
  const { actiongroups, permissions } = actionGroupsToActiongroupsAndPermissions(cloneDeep(actionGroups));
  const omitCurrentId = (options = [], currentId) => options.filter(id => id !== currentId);

  return {
    allSinglePermissions: arrayToComboBoxOptions(sortBy(omitCurrentId(permissions, currentId))),
    allActionGroups: arrayToComboBoxOptions(sortBy(omitCurrentId(actiongroups, currentId)))
  };
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
