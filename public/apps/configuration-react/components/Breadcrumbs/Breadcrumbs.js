import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flatten, get } from 'lodash';
import queryString from 'query-string';
import { EuiBreadcrumbs } from '@elastic/eui';
import { homeText } from '../../utils/i18n/home';
import {
  internalUsersText,
  createInternalUserText,
  updateInternalUserText
} from '../../utils/i18n/internal_users';
import {
  authenticationAndAuthorizationText,
} from '../../utils/i18n/auth';
import {
  systemStatusText,
  uploadLicenseText
} from '../../utils/i18n/system_status';
import {
  tenantsText,
  createTenantText,
  updateTenantText
} from '../../utils/i18n/tenants';
import {
  actionGroupsText,
  createActionGroupText,
  updateActionGroupText
} from '../../utils/i18n/action_groups';
import {
  rolesText,
  createRoleText,
  updateRoleText
} from '../../utils/i18n/roles';
import {
  roleMappingsText,
  createRoleMappingText,
  updateRoleMappingText
} from '../../utils/i18n/role_mappings';
import {
  APP_PATH,
  SYSTEM_STATUS_ACTIONS,
  TENANTS_ACTIONS,
  INTERNAL_USERS_ACTIONS,
  ACTION_GROUPS_ACTIONS,
  ROLES_ACTIONS,
  ROLE_MAPPINGS_ACTIONS
} from '../../utils/constants';

export const createBreadcrumb = (breadcrumb, history) => {
  const { text, href } = breadcrumb;
  return {
    title: get(text, 'props.default', text),
    text,
    href: `#${href}`,
    onClick: e => {
      e.preventDefault();
      history.push(href);
    },
  };
};

export const getBreadcrumb = route => {
  const [ base, queryParams ] = route.split('?');
  if (!base) return null;

  const { id, action } = queryString.parse(queryParams);
  const uploadLicense = action === SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE;
  const updateTenant = action === TENANTS_ACTIONS.UPDATE_TENANT;
  const updateUser = action === INTERNAL_USERS_ACTIONS.UPDATE_USER;
  const updateActionGroup = action === ACTION_GROUPS_ACTIONS.UPDATE_ACTION_GROUP;
  const updateRole = action === ROLES_ACTIONS.UPDATE_ROLE;
  const updateRoleMapping = action === ROLE_MAPPINGS_ACTIONS.UPDATE_ROLE_MAPPING;

  const removePrefixSlash = path => path.slice(1);
  const breadcrumb = {
    '#': { text: homeText, href: APP_PATH.HOME },
    [removePrefixSlash(APP_PATH.INTERNAL_USERS)]: {
      text: internalUsersText,
      href: APP_PATH.INTERNAL_USERS
    },
    [removePrefixSlash(APP_PATH.CREATE_INTERNAL_USER)]: [
      { text: internalUsersText, href: APP_PATH.INTERNAL_USERS },
      { text: (updateUser ? updateInternalUserText : createInternalUserText), href: APP_PATH.CREATE_INTERNAL_USER }
    ],
    [removePrefixSlash(APP_PATH.AUTH)]: [
      { text: authenticationAndAuthorizationText, href: APP_PATH.AUTH },
    ],
    [removePrefixSlash(APP_PATH.SYSTEM_STATUS)]: [
      { text: systemStatusText, href: APP_PATH.SYSTEM_STATUS },
    ],
    [removePrefixSlash(APP_PATH.TENANTS)]: [
      { text: tenantsText, href: APP_PATH.TENANTS },
    ],
    [removePrefixSlash(APP_PATH.CREATE_TENANT)]: [
      { text: tenantsText, href: APP_PATH.TENANTS },
      { text: (updateTenant ? updateTenantText : createTenantText), href: APP_PATH.CREATE_TENANT }
    ],
    [removePrefixSlash(APP_PATH.ACTION_GROUPS)]: [
      { text: actionGroupsText, href: APP_PATH.ACTION_GROUPS },
    ],
    [removePrefixSlash(APP_PATH.CREATE_ACTION_GROUP)]: [
      { text: actionGroupsText, href: APP_PATH.ACTION_GROUPS },
      { text: (updateActionGroup ? updateActionGroupText : createActionGroupText), href: APP_PATH.CREATE_ACTION_GROUP }
    ],
    [removePrefixSlash(APP_PATH.ROLES)]: [
      { text: rolesText, href: APP_PATH.ROLES },
    ],
    [removePrefixSlash(APP_PATH.CREATE_ROLE)]: [
      { text: rolesText, href: APP_PATH.ROLES },
      { text: (updateRole ? updateRoleText : createRoleText), href: APP_PATH.CREATE_ROLE }
    ],
    [removePrefixSlash(APP_PATH.ROLE_MAPPINGS)]: [
      { text: roleMappingsText, href: APP_PATH.ROLE_MAPPINGS },
    ],
    [removePrefixSlash(APP_PATH.CREATE_ROLE_MAPPING)]: [
      { text: roleMappingsText, href: APP_PATH.ROLE_MAPPINGS },
      { text: (updateRoleMapping ? updateRoleMappingText : createRoleMappingText), href: APP_PATH.CREATE_ROLE_MAPPING }
    ]
  }[base];

  let args = `?action=${action}`;
  if (uploadLicense) {
    breadcrumb.push({ text: uploadLicenseText, href: APP_PATH.SYSTEM_STATUS + args });
  }

  args = `?id=${id}&action=${action}`;
  if (updateUser) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_INTERNAL_USER + args });
  }
  if (updateTenant) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_TENANT + args });
  }
  if (updateActionGroup) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_ACTION_GROUP + args });
  }
  if (updateRole) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_ROLE + args });
  }
  if (updateRoleMapping) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_ROLE_MAPPING + args });
  }

  return breadcrumb;
};

class Breadcrumbs extends Component {
  constructor(props) {
    super(props);

    this.state = { breadcrumbs: this.props.breadcrumbs };
  }

  componentDidMount() {
    this.getBreadcrumbs();
  }

  componentDidUpdate(prevProps) {
    const { location: { pathname: prevPathname, search: prevSearch } } = prevProps;
    const { location: { pathname, search } } = this.props;

    if (prevPathname + prevSearch !== pathname + search) {
      this.getBreadcrumbs();
    }
  }

  getBreadcrumbs = () => {
    const { history } = this.props;

    const parseLocationHash = hash => hash.split('/').filter(route => !!route);
    const routes = parseLocationHash(window.location.hash);
    let rawBreadcrumbs = routes.map(route => getBreadcrumb(route));
    rawBreadcrumbs = flatten(rawBreadcrumbs).filter(breadcrumb => !!breadcrumb);
    const breadcrumbs = rawBreadcrumbs.map(breadcrumb => createBreadcrumb(breadcrumb, history));
    this.setState({ breadcrumbs });
  }

  render() {
    const { breadcrumbs } = this.state;
    return (
      <EuiBreadcrumbs
        breadcrumbs={breadcrumbs}
        responsive={false}
        truncate={true}
        className="sgBreadcrumbs"
      />
    );
  }
}

Breadcrumbs.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

Breadcrumbs.defaultProps = {
  breadcrumbs: []
};

export default Breadcrumbs;
