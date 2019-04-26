import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flatten } from 'lodash';
import queryString from 'query-string';
import { EuiBreadcrumbs, EuiI18n } from '@elastic/eui';
import { APP_PATH, INTERNAL_USERS_ACTIONS } from '../../utils/constants';

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

  const isElasticsearchDocId = base => RegExp(/^[0-9a-z_-]{20}$/i).test(base);
  if (isElasticsearchDocId(base)) {
    const { action } = queryString.parse(`?${queryParams}`);
    switch (action) {
      case INTERNAL_USERS_ACTIONS.UPDATE_USER:
        // TODO: query API to get user doc, retrieve the user name and put it in breadcrumbs
        const userName = base;
        const updateInternalUserText = (<EuiI18n token="sgUpdateInternalUser.text" default="Update User" />);
        return [
          { text: userName, href: `${APP_PATH.INTERNAL_USERS}/${base}` },
          { text: updateInternalUserText, href: APP_PATH.CREATE_INTERNAL_USER }
        ];
    }
  }

  const homeText = (<EuiI18n token="sgHome.text" default="Home" />);
  const internalUsersText = (<EuiI18n token="sgInternalUsers.text" default="Internal Users" />);
  const createInternalUserText = (<EuiI18n token="sgCreateInternalUser.text" default="Create User" />);

  const removePrefixSlash = path => path.slice(1);
  return {
    '#': { text: homeText, href: APP_PATH.HOME },
    [removePrefixSlash(APP_PATH.INTERNAL_USERS)]: {
      text: internalUsersText,
      href: APP_PATH.INTERNAL_USERS
    },
    [removePrefixSlash(APP_PATH.CREATE_INTERNAL_USER)]: [
      { text: internalUsersText, href: APP_PATH.INTERNAL_USERS },
      { text: createInternalUserText, href: APP_PATH.CREATE_INTERNAL_USER }
    ]
  }[base];
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
