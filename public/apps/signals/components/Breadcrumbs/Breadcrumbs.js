import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flatten, get } from 'lodash';
import queryString from 'query-string';
import { EuiBreadcrumbs } from '@elastic/eui';
// import { homeText } from '../../utils/i18n/home';
// import {
//   internalUsersText,
//   createInternalUserText,
//   updateInternalUserText
// } from '../../utils/i18n/internal_users';
// import {
//   authenticationAndAuthorizationText,
// } from '../../utils/i18n/auth';
// import {
//   systemStatusText,
//   uploadLicenseText
// } from '../../utils/i18n/system_status';
// import {
//   tenantsText,
//   createTenantText,
//   updateTenantText
// } from '../../utils/i18n/tenants';
// import {
//   actionGroupsText,
//   createActionGroupText,
//   updateActionGroupText
// } from '../../utils/i18n/action_groups';
// import {
//   rolesText,
//   createRoleText,
//   updateRoleText
// } from '../../utils/i18n/roles';
// import {
//   roleMappingsText,
//   createRoleMappingText,
//   updateRoleMappingText
// } from '../../utils/i18n/role_mappings';
// import {
//   APP_PATH,
//   SYSTEM_STATUS_ACTIONS,
//   TENANTS_ACTIONS,
//   INTERNAL_USERS_ACTIONS,
//   ACTION_GROUPS_ACTIONS,
//   ROLES_ACTIONS,
//   ROLE_MAPPINGS_ACTIONS
// } from '../../utils/constants';
import {
  APP_PATH,
} from '../../utils/constants';

export const createBreadcrumb = (breadcrumb, history) => {
  const { text, href } = breadcrumb;
  return {
    title: get(text, 'props.default', text),
    text,
    href: href === '#' ? '#' : `#${href}`,
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
  const urlParams =  (id && action) ? `?id=${id}&action=${action}` : '';

  const removePrefixSlash = path => path.slice(1);

  const breadcrumb = {
    '#': { text: 'Dashboard', href: APP_PATH.DASHBOARD },
    [removePrefixSlash(APP_PATH.WATCHES)]: {
      text: 'Watches',
      href: APP_PATH.WATCHES
    },
    [removePrefixSlash(APP_PATH.DEFINE_WATCH)]: [
      { text: 'Watches', href: APP_PATH.WATCHES },
      { text: 'Define Watch', href: APP_PATH.DEFINE_WATCH + urlParams }
    ],
    [removePrefixSlash(APP_PATH.DESTINATIONS)]: {
      text: 'Destinations',
      href: APP_PATH.DESTINATIONS
    },
    [removePrefixSlash(APP_PATH.DEFINE_DESTINATION)]: [
      { text: 'Destinations', href: APP_PATH.DESTINATIONS },
      { text: 'Define Destination', href: APP_PATH.DEFINE_DESTINATION + urlParams }
    ],
  }[base];

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
