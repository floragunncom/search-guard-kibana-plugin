import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flatten } from 'lodash';
import queryString from 'query-string';
import { EuiBreadcrumbs } from '@elastic/eui';
import {
  i18nHomeText,
  i18nInternalUsersText,
  i18nCreateInternalUserText,
} from '../../utils/i18n_nodes';
import {
  authenticationAndAuthorizationText,
} from '../../utils/i18n/auth';
import {
  systemStatusText,
  uploadLicenseText
} from '../../utils/i18n/system_status';
import { APP_PATH, SYSTEM_STATUS_ACTIONS } from '../../utils/constants';

export const createBreadcrumb = (breadcrumb, history) => {
  const { text, href } = breadcrumb;
  return {
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

  const removePrefixSlash = path => path.slice(1);
  const breadcrumb = {
    '#': { text: i18nHomeText, href: APP_PATH.HOME },
    [removePrefixSlash(APP_PATH.INTERNAL_USERS)]: {
      text: i18nInternalUsersText,
      href: APP_PATH.INTERNAL_USERS
    },
    [removePrefixSlash(APP_PATH.CREATE_INTERNAL_USER)]: [
      { text: i18nInternalUsersText, href: APP_PATH.INTERNAL_USERS },
      { text: i18nCreateInternalUserText, href: APP_PATH.CREATE_INTERNAL_USER }
    ],
    [removePrefixSlash(APP_PATH.AUTH)]: [
      { text: authenticationAndAuthorizationText, href: APP_PATH.AUTH },
    ],
    [removePrefixSlash(APP_PATH.SYSTEM_STATUS)]: [
      { text: systemStatusText, href: APP_PATH.SYSTEM_STATUS },
    ]
  }[base];

  const { id, action } = queryString.parse(queryParams);
  if (id) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_INTERNAL_USER + `?id=${id}` });
  }

  const uploadLicense = action === SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE;
  if (uploadLicense) {
    breadcrumb.push({ text: uploadLicenseText, href: APP_PATH.SYSTEM_STATUS + `?action=${action}` });
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
