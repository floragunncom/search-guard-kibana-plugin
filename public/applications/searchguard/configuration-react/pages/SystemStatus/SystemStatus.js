/*
 *    Copyright 2020 floragunn GmbH
 *
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

/* eslint-disable import/namespace */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, get, toUpper } from 'lodash';
import queryString from 'query-string';
import { EuiFlexItem, EuiFlexGroup, EuiSideNav, EuiButton } from '@elastic/eui';
import { ContentPanel, CancelButton } from '../../components';
import { UploadLicense, SystemStatusContent } from './components';
import { SELECTED_SIDE_NAV_ITEM_NAME, SIDE_NAV } from './utils/constants';
import { navigateText } from '../../utils/i18n/common';
import * as systemStatusI18nLabels from '../../utils/i18n/system_status';
import { APP_PATH, SYSTEM_STATUS_ACTIONS } from '../../utils/constants';
import { getResource } from './utils';
import { sideNavItem } from '../../utils/helpers';
import { Context } from '../../Context';

class SystemStatus extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.state = {
      resources: {},
      isLoading: true,
      selectedSideNavItemName: SELECTED_SIDE_NAV_ITEM_NAME,
      isSideNavOpenOnMobile: false,
    };

    this.configService = context.configService;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    // Select side nav item
    const { selectedSideNavItemName } = get(this.props, 'location.state', {});
    const { selectedSideNavItemName: prevSelectedSideNavItemName } = prevState;
    if (
      SIDE_NAV[toUpper(selectedSideNavItemName)] &&
      selectedSideNavItemName !== prevSelectedSideNavItemName
    ) {
      this.selectSideNavItem(selectedSideNavItemName);
    }

    // Fetch data
    const { action: prevAction } = queryString.parse(prevProps.location.search);
    const { action } = queryString.parse(this.props.location.search);
    const uploadedLicense =
      prevAction === SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE && action !== prevAction;
    if (uploadedLicense) this.fetchData();
  }

  fetchData = async () => {
    try {
      this.setState({ isLoading: true });

      const resources = this.configService.get('systeminfo');
      resources.sg_version = this.configService.get('searchguard.sgVersion');

      this.setState({ resources });
    } catch (error) {
      this.context.triggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  };

  toggleOpenOnMobile = () => {
    this.setState({
      isSideNavOpenOnMobile: !this.state.isSideNavOpenOnMobile,
    });
  };

  selectSideNavItem = (selectedSideNavItemName) => {
    this.setState({ selectedSideNavItemName });
  };

  getSideNavItems = () => {
    const items = filter(SIDE_NAV, (e) => e !== SIDE_NAV.SYSTEM_STATUS).map((name) =>
      sideNavItem({
        name,
        id: name,
        onClick: () => this.selectSideNavItem(name),
        text: systemStatusI18nLabels[name],
        isActive: this.state.selectedSideNavItemName === name,
      })
    );

    return [
      sideNavItem({
        id: SIDE_NAV.SYSTEM_STATUS,
        name: SIDE_NAV.SYSTEM_STATUS,
        text: systemStatusI18nLabels[SIDE_NAV.SYSTEM_STATUS],
        navData: { items },
        isCategory: true,
      }),
    ];
  };

  renderUploadLicenseButton = (history, location) => (
    <EuiButton
      data-test-subj="sgUploadLicenseButton"
      onClick={() => {
        this.props.history.push({
          ...location,
          search: `?action=${SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE}`,
        });
      }}
    >
      {systemStatusI18nLabels.uploadLicenseText}
    </EuiButton>
  );

  render() {
    const { history, location } = this.props;
    const { selectedSideNavItemName, isSideNavOpenOnMobile, resources } = this.state;

    const { action } = queryString.parse(location.search);
    const uploadLicense = action === SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE;
    if (uploadLicense) {
      return <UploadLicense {...this.props} />;
    }

    const sideNavItems = this.getSideNavItems();
    const resource = getResource(selectedSideNavItemName, resources);

    return (
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiSideNav
            mobileTitle={navigateText}
            toggleOpenOnMobile={this.toggleOpenOnMobile}
            isOpenOnMobile={isSideNavOpenOnMobile}
            className="sgSideNav"
            items={sideNavItems}
          />
        </EuiFlexItem>

        <EuiFlexItem>
          <ContentPanel
            title={systemStatusI18nLabels[selectedSideNavItemName]}
            actions={[
              <CancelButton onClick={() => history.push(APP_PATH.HOME)} />,
              this.renderUploadLicenseButton(history, location),
            ]}
          >
            <SystemStatusContent resource={resource} sideNavItemName={selectedSideNavItemName} />
          </ContentPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

SystemStatus.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default SystemStatus;
