import { BrowserStorageService } from '../services';
import { get, reduce, sortBy, uniqBy, forEach, map } from 'lodash';

export const stringifyPretty = json => JSON.stringify(json, null, 2);

export const checkIfLicenseValid = () => ({
  isValid: !!get(BrowserStorageService.systemInfo(), 'sg_license.is_valid'),
  messages: get(BrowserStorageService.systemInfo(), 'sg_license.msgs'),
});

export const readFileAsText = (file, FileReader = window.FileReader) => {
  if (!file) return;
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = ({ target: { result } }) => resolve(result);
    fr.onerror = err => reject(err);
    fr.readAsText(file);
  });
};

export const isSinglePermission = permission => {
  return permission.startsWith('cluster:') || permission.startsWith('indices:') || permission.startsWith('kibana:');
};

export const arrayToComboBoxOptions = array => sortBy(array.map(label => ({ label })));
export const comboBoxOptionsToArray = array => sortBy(array.map(({ label }) => label));

export const allowedActionsToPermissionsAndActiongroups = (allowedActions = []) => {
  const { actiongroups, permissions } = reduce(allowedActions, (result, permission) => {
    if (isSinglePermission(permission)) {
      result.permissions.push(permission);
    } else {
      result.actiongroups.push(permission);
    }
    return result;
  }, { actiongroups: [], permissions: [] });

  return {
    actiongroups: uniqBy(sortBy(actiongroups)),
    permissions: uniqBy(sortBy(permissions))
  };
};

export const actionGroupToActiongroupsAndPermissions = (actionGroup = {}) => {
  const { permissions, actiongroups } = allowedActionsToPermissionsAndActiongroups(actionGroup.allowed_actions || []);

  forEach(actionGroup.actiongroups, item => {
    actiongroups.push(item);
  });

  forEach(actionGroup.permissions, item => {
    permissions.push(item);
  });

  return {
    ...actionGroup,
    permissions: uniqBy(sortBy(permissions)),
    actiongroups: uniqBy(sortBy(actiongroups))
  };
};

export const actionGroupsToActiongroupsAndPermissions = (actionGroups = {}) => {
  const { actiongroups, permissions } = reduce(actionGroups, (result, values, groupName) => {
    result.actiongroups.push(groupName);

    const { permissions, actiongroups } = actionGroupToActiongroupsAndPermissions(values);

    forEach(actiongroups, item => {
      result.actiongroups.push(item);
    });

    forEach(permissions, item => {
      result.permissions.push(item);
    });

    return result;
  }, { permissions: [], actiongroups: [] });

  return {
    actiongroups: uniqBy(sortBy(actiongroups)),
    permissions: uniqBy(sortBy(permissions))
  };
};

export const attributesToUiAttributes = (attributes = {}) => map(attributes, (value, key) => ({ value, key }));
export const uiAttributesToAttributes = (attributes = []) => attributes.reduce((result, { key, value }) => {
  result[key] = value;
  return result;
}, {});

export const internalUsersToUiBackendRoles = (internalUsers = {}) => {
  return arrayToComboBoxOptions(uniqBy(sortBy(reduce(internalUsers, (result, user) => {
    user.backend_roles.forEach(role => {
      result.push(role);
    });
    return result;
  }, []))));
};
