/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
  * Copyright 2015-2019 _floragunn_ GmbH
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  * http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flatten, get } from 'lodash';
import { EuiBreadcrumbs, EuiErrorBoundary } from '@elastic/eui';

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

    const locationPaths = history.location.pathname.split('/');

    // TODO Better way to deactivate the breadcrumbs in the template
    // This is a special case for the ack action deeplink
    // The path is /watch/:watchId/ack/:actionId?
    if (locationPaths[1] === 'watch' && locationPaths[3] === 'ack') {
      this.setState({ breadcrumbs: [] });
      return;
    }

    let rawBreadcrumbs = routes.map(route => this.props.onGetBreadcrumb(route));
    rawBreadcrumbs = flatten(rawBreadcrumbs).filter(breadcrumb => !!breadcrumb);

    const breadcrumbs = rawBreadcrumbs.map(breadcrumb => createBreadcrumb(breadcrumb, history));
    this.setState({ breadcrumbs });
  }

  render() {
    const { breadcrumbs } = this.state;
    return (
      <EuiErrorBoundary>
        <EuiBreadcrumbs
          breadcrumbs={breadcrumbs}
          responsive={false}
          truncate={true}
          className="sgBreadcrumbs"
          data-test-subj="sgBreadcrumbs"
        />
      </EuiErrorBoundary>
    );
  }
}

Breadcrumbs.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  onGetBreadcrumb: PropTypes.func.isRequired
};

Breadcrumbs.defaultProps = {
  breadcrumbs: []
};

export default Breadcrumbs;
