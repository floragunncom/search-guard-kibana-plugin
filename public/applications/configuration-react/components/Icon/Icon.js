/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { isObject } from 'lodash';
import Empty from './assets/empty';
import { Context } from '../../Context';

const icons = {
  logo: require('./assets/logo'),
  logo_dark: require('./assets/logo_dark'),
  tenants: require('./assets/tenants'),
  tenants_dark: require('./assets/tenants_dark'),
  tenantPattern: require('./assets/tenant_pattern'),
  tenantPattern_dark: require('./assets/tenant_pattern_dark'),
  systemStatus: require('./assets/system_status'),
  systemStatus_dark: require('./assets/system_status_dark'),
  roleMappings: require('./assets/role_mappings'),
  roleMappings_dark: require('./assets/role_mappings_dark'),
  purgeCache: require('./assets/purge_cache'),
  purgeCache_dark: require('./assets/purge_cache_dark'),
  internalUsersDatabase: require('./assets/internal_users_database'),
  internalUsersDatabase_dark: require('./assets/internal_users_database_dark'),
  indexPattern: require('./assets/index_pattern'),
  indexPattern_dark: require('./assets/index_pattern_dark'),
  authcAndAuthz: require('./assets/authc_and_authz'),
  authcAndAuthz_dark: require('./assets/authc_and_authz_dark'),
  actionGroups: require('./assets/action_groups'),
  actionGroups_dark: require('./assets/action_groups_dark'),
  roles: require('./assets/roles'),
  roles_dark: require('./assets/roles_dark')
};

const sizes = {
  'm': { width: '18px', height: '18px' },
  'l': { width: '24px', height: '24px' },
  'xl': { width: '36px', height: '36px' },
  'xxl': { width: '48px', height: '48px' }
};

const Icon = ({ type, size = 'xl' }) => {
  const { configService } = useContext(Context);

  const _size = isObject(size) ? size : sizes[size];
  const _type = configService.get('is_dark_mode') ? type + '_dark' : type;
  const Svg = icons[_type] ? icons[_type].default : Empty;
  return (<Svg {..._size} />);
};

Icon.propTypes = {
  type: PropTypes.oneOf([
    'logo',
    'tenants',
    'tenantPattern',
    'systemStatus',
    'roleMappings',
    'purgeCache',
    'internalUsersDatabase',
    'indexPattern',
    'authcAndAuthz',
    'actionGroups',
    'roles'
  ]).isRequired,
  size: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      height: PropTypes.string.isRequired,
      width: PropTypes.string.isRequired
    })
  ])
};

export default Icon;
