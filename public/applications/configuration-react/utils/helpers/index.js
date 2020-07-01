import SessionStorageService from '../../services/SessionStorageService';
import { INDEX_PERMISSIONS, CLUSTER_PERMISSIONS } from '../constants';
import { get, reduce, sortBy, uniqBy, map, filter } from 'lodash';

export { default as sideNavItem } from './sideNavItem';

export const stringifyPretty = json => JSON.stringify(json, null, 2);

export const checkIfLicenseValid = () => ({
  isValid: !!get(SessionStorageService.systemInfo(), 'sg_license.is_valid'),
  messages: get(SessionStorageService.systemInfo(), 'sg_license.msgs'),
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

export const isSinglePermission = (permission = '') => {
  return permission.startsWith('cluster:')
    || permission.startsWith('indices:')
    || permission.startsWith('kibana:')
    || permission.startsWith('signals:');
};

export const arrayToComboBoxOptions = array => sortBy(array.map(label => ({ label })), 'label');
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

export const attributesToUiAttributes = (attributes = {}) => sortBy(map(attributes, (value, key) => ({ value, key })));
export const uiAttributesToAttributes = (attributes = []) => attributes.reduce((result, { key, value }) => {
  if (key.trim() !== '') {
    result[key] = value;
  }
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

export const getAllUiClusterPermissions = () => map(CLUSTER_PERMISSIONS, ({ name }) => ({ label: name }));
export const getAllUiIndexPermissions = () => map(INDEX_PERMISSIONS, ({ name }) => ({ label: name }));

export const filterReservedStaticTableResources = (resources = [], isShowingSystemItems = false) => !isShowingSystemItems
  ? filter(resources, resource => !resource.reserved && !resource.static)
  : resources;
