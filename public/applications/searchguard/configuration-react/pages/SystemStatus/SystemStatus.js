/* eslint-disable @kbn/eslint/require-license-header */
/* eslint-disable import/namespace */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, get, toUpper } from 'lodash';
import queryString from 'query-string';
import { EuiFlexItem, EuiFlexGroup, EuiSideNav, EuiButton } from '@elastic/eui';
import { ContentPanel, CancelButton } from '../../components';
import { UploadLicense, SystemStatusContent } from './components';
import { Templates } from './components/Templates/Templates';
import { SELECTED_SIDE_NAV_ITEM_NAME, SIDE_NAV } from './utils/constants';
import { navigateText } from '../../utils/i18n/common';
import * as systemStatusI18nLabels from '../../utils/i18n/system_status';
import { APP_PATH, SYSTEM_STATUS_ACTIONS } from "../../utils/constants";
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
      selectedSideNavItemName: this.getSelectedSideNavItemName(this.props.location),
      isSideNavOpenOnMobile: false,
    };

    this.configService = context.configService;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    // Select side nav item
    // todo This doesn't seem like it is in use anymore. Or where/when does location.state get populated?
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

  /**
   * This is kind of a workaround to at least add a direct link to
   * any given side nav item. Just adding another path in to the
   * pathname would break the current logic for navigating
   * to the upload license page. Hence, I opted for just
   * keeping that pattern for now.
   * A proper navigation would of course be better.
   * @param location
   * @returns {*|string}
   */
  getSelectedSideNavItemName(location) {
    const { action } = queryString.parse(location.search);

    if (action) {
      const lowercaseAction = action.toLowerCase();
      if(['cluster', 'license', 'templates'].indexOf(lowercaseAction) > -1) {
        return lowercaseAction;
      }
    }

    return SELECTED_SIDE_NAV_ITEM_NAME;
  }

  selectSideNavItem = selectedSideNavItemName => {
    this.setState({ selectedSideNavItemName });
  };

  getSideNavItems = () => {
    const items = filter(SIDE_NAV, e => e !== SIDE_NAV.SYSTEM_STATUS).map(name =>
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

    // Currently, we don't want to show the upload licence button on the template page
    const showUploadButton = selectedSideNavItemName !== SIDE_NAV.TEMPLATES;

    const { action } = queryString.parse(location.search);
    const uploadLicense = action === SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE;
    if (uploadLicense) {
      return <UploadLicense {...this.props} />;
    }

    const sideNavItems = this.getSideNavItems();
    const resource = getResource(selectedSideNavItemName, resources);

    const actions = [
      <CancelButton onClick={() => history.push(APP_PATH.HOME)} />
    ];

    if (showUploadButton) {
      actions.push(this.renderUploadLicenseButton(history, location));
    }

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
            actions={actions}
          >
            {selectedSideNavItemName === SIDE_NAV.TEMPLATES && (
              <Templates></Templates>
            )}
            {selectedSideNavItemName !== SIDE_NAV.TEMPLATES && (
              <SystemStatusContent resource={resource} sideNavItemName={selectedSideNavItemName} />
            )}
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
