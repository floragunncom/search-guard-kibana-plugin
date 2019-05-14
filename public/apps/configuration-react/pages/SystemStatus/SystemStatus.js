/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { get, map } from 'lodash';
import queryString from 'query-string';
import {
  EuiIcon,
  EuiFlexItem,
  EuiFlexGroup,
  EuiSideNav,
  EuiButton,
  EuiFlexGrid,
  EuiSpacer,
  EuiText
} from '@elastic/eui';
import { ContentPanel } from '../../components';
import { SystemService } from '../../services';
import { UploadLicense } from './components';
import { SELECTED_SIDE_NAV_ITEM_NAME } from './utils/constants';
import { navigateText, cancelText } from '../../utils/i18n/common';
import * as systemStatusI18nLabels from '../../utils/i18n/system_status';
import { APP_PATH, CALLOUTS, SYSTEM_STATUS_ACTIONS } from '../../utils/constants';
import { getResource } from './utils';

const SystemStatusContent = ({ resource, sideNavItemName }) => {
  const isActiveModulesSection = sideNavItemName === 'activeModules';
  return (
    <Fragment>
      <EuiFlexGrid columns={2}>
        {map(resource, (value, key) => {
          return !isActiveModulesSection ? (
            <Fragment key={key}>
              <EuiFlexItem>
                {systemStatusI18nLabels[key]}
              </EuiFlexItem>
              <EuiFlexItem>
                <pre><code>{value.toString()}</code></pre>
              </EuiFlexItem>
            </Fragment>
          ) : (
            <EuiSpacer size="m" />
          );
        })}
      </EuiFlexGrid>

      {isActiveModulesSection && (
        <Fragment>
          <EuiFlexGrid columns={3}>
            <EuiFlexItem><EuiText><h3>{systemStatusI18nLabels.name}</h3></EuiText></EuiFlexItem>
            <EuiFlexItem><EuiText><h3>{systemStatusI18nLabels.version}</h3></EuiText></EuiFlexItem>
            <EuiFlexItem><EuiText><h3>{systemStatusI18nLabels.isEnterprise}</h3></EuiText></EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="m" />
        </Fragment>
      )}

      <EuiFlexGrid columns={3}>
        {map(resource, (value, key) => {
          return isActiveModulesSection && (
            <Fragment key={key}>
              <EuiFlexItem>
                {systemStatusI18nLabels[key]}
              </EuiFlexItem>
              <EuiFlexItem>
                {value.version}
              </EuiFlexItem>
              <EuiFlexItem>
                {value.is_enterprise.toString()}
              </EuiFlexItem>
            </Fragment>
          );
        })}
      </EuiFlexGrid>

    </Fragment>
  );
};

class SystemStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: {},
      error: null,
      isLoading: true,
      selectedSideNavItemName: SELECTED_SIDE_NAV_ITEM_NAME,
      isSideNavOpenOnMobile: false
    };

    this.backendService = new SystemService(this.props.httpClient);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      this.setState({ isLoading: true });
      const { data: resources } = await this.backendService.getSystemInfo();
      this.setState({ resources, error: null });
    } catch(error) {
      this.handleTriggerCallout(error);
    }
    this.setState({ isLoading: false });
  }

  handleTriggerCallout = error => {
    error = error.data || error;
    this.setState({ error });
    this.props.onTriggerCallout({
      type: CALLOUTS.ERROR_CALLOUT,
      payload: get(error, 'message')
    });
  }

  toggleOpenOnMobile = () => {
    this.setState({
      isSideNavOpenOnMobile: !this.state.isSideNavOpenOnMobile
    });
  };

  selectSideNavItem = selectedSideNavItemName => {
    this.setState({ selectedSideNavItemName });
  };

  createSideNavItem = (name, navData = {}) => {
    return {
      onClick: () => this.selectSideNavItem(name),
      ...navData,
      id: name,
      name: systemStatusI18nLabels[name],
      isSelected: this.state.selectedSideNavItemName === name
    };
  };

  getSideNavItems = () => {
    return [
      this.createSideNavItem('systemStatus', {
        icon: <EuiIcon type="gear"/>,
        items: ['cluster', 'license', 'activeModules'].map(item => {
          return this.createSideNavItem(item);
        }),
        onClick: () => undefined
      })
    ];
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.HOME)}>
      {cancelText}
    </EuiButton>
  )

  renderUploadLicenseButton = (history, location) => (
    <EuiButton
      onClick={() => {
        this.props.history.push({
          ...location,
          search: `?action=${SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE}`
        });
      }}
    >
      {systemStatusI18nLabels.uploadLicenseText}
    </EuiButton>
  )

  render() {
    const { history, location } = this.props;
    const { selectedSideNavItemName, isSideNavOpenOnMobile, resources } = this.state;

    const { action } = queryString.parse(location.search);
    const uploadLicense = action === SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE;
    if (uploadLicense) {
      return (<UploadLicense {...this.props} />);
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
              this.renderCancelButton(history),
              this.renderUploadLicenseButton(history, location)
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
  httpClient: PropTypes.func.isRequired,
  onTriggerCallout: PropTypes.func.isRequired
};

export default SystemStatus;
