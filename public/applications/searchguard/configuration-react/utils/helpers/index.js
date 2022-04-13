import { assign, cloneDeep, reduce, sortBy, uniqBy, map, filter } from 'lodash';
import { INDEX_PERMISSIONS, CLUSTER_PERMISSIONS, PAGE_NAMES, PAGE_CONFIGS } from '../constants';

export { default as sideNavItem } from './sideNavItem';

export const stringifyPretty = json => JSON.stringify(json, null, 2);

export const checkIfLicenseValid = (configService) => ({
  isValid: configService.get('systeminfo.sg_license.is_valid', false),
  messages: configService.get('systeminfo.sg_license.msgs', []),
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

export const arrayToComboBoxOptions = (array = []) => sortBy(array.map(label => ({ label })), 'label');
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
	if (!user.backend_roles) {
      return result;
	}
	
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

export function isEndpointAndMethodEnabled(restapiinfo, endpoint, method) {
  if (restapiinfo && restapiinfo.disabled_endpoints) {
    if (restapiinfo.disabled_endpoints[endpoint]) {
      return restapiinfo.disabled_endpoints[endpoint].indexOf(method) === -1;
    } else {
      return true;
    }
  }

  return false;
}

export function buildSeardGuardConfiguration({ restapiinfo, searchguard }) {
  const searchguardConfiguration = cloneDeep(searchguard.configuration);
  const pagesConfiguration = Object.keys(PAGE_NAMES).reduce((pagesConfiguration, pageName) => {
    pagesConfiguration[pageName] = {
      enabled:
        searchguardConfiguration[pageName].enabled &&
        isEndpointAndMethodEnabled(
          restapiinfo,
          PAGE_CONFIGS[pageName].api.endpoint,
          PAGE_CONFIGS[pageName].api.method
        ),
    };

    return pagesConfiguration;
  }, {});

  assign(searchguardConfiguration, pagesConfiguration);
  return searchguardConfiguration;
}
