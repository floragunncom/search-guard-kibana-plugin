/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { get, map, toString, filter } from 'lodash';
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
import { CancelButton } from '../../components/ContentPanel/components';
import { SELECTED_SIDE_NAV_ITEM_NAME, SIDE_NAV } from './utils/constants';
import { navigateText, cancelText } from '../../utils/i18n/common';
import * as systemStatusI18nLabels from '../../utils/i18n/system_status';
import { APP_PATH, SYSTEM_STATUS_ACTIONS } from '../../utils/constants';
import { getResource } from './utils';
import { sideNavItem } from '../../utils/helpers';

const SystemStatusContent = ({ resource, sideNavItemName }) => {
  const isActiveModulesSection = sideNavItemName === SIDE_NAV.ACTIVE_MODULES;
  return (
    <Fragment>
      <EuiFlexGrid columns={2} className="sgFixedFormGroupItem">
        {map(resource, (value, key) => {
          return !isActiveModulesSection ? (
            <Fragment key={key}>
              <EuiFlexItem>
                <EuiText data-test-subj={`sgSystemStatusContentKey-${key}`}>
                  {systemStatusI18nLabels[key]}
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                {React.isValidElement(value) ? (
                  <div data-test-subj={`sgSystemStatusContentValue-${key}`}>{value}</div>
                ) : (
                  <EuiText data-test-subj={`sgSystemStatusContentValue-${key}`}>{toString(value)}</EuiText>
                )}
              </EuiFlexItem>
            </Fragment>
          ) : (
            <EuiSpacer key={key} size="m" />
          );
        })}
      </EuiFlexGrid>

      {isActiveModulesSection && (
        <Fragment>
          <EuiFlexGrid columns={3} className="sgFixedFormGroupItem">
            <EuiFlexItem><EuiText><h3>{systemStatusI18nLabels.name}</h3></EuiText></EuiFlexItem>
            <EuiFlexItem><EuiText><h3>{systemStatusI18nLabels.version}</h3></EuiText></EuiFlexItem>
            <EuiFlexItem><EuiText><h3>{systemStatusI18nLabels.isEnterprise}</h3></EuiText></EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="m" />
        </Fragment>
      )}

      <EuiFlexGrid columns={3} className="sgFixedFormGroupItem">
        {map(resource, (value, key) => {
          return isActiveModulesSection && (
            <Fragment key={key}>
              <EuiFlexItem>
                <EuiText data-test-subj={`sgSystemStatusContentActiveModulesName-${key}`}>
                  {systemStatusI18nLabels[key]}
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText data-test-subj={`sgSystemStatusContentActiveModulesVersion-${key}`}>
                  {value.version}
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText data-test-subj={`sgSystemStatusContentActiveModulesIsEnterprise-${key}`}>
                  {value.is_enterprise.toString()}
                </EuiText>
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
      this.setState({ resources });
    } catch(error) {
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  toggleOpenOnMobile = () => {
    this.setState({
      isSideNavOpenOnMobile: !this.state.isSideNavOpenOnMobile
    });
  };

  selectSideNavItem = selectedSideNavItemName => {
    this.setState({ selectedSideNavItemName });
  };

  getSideNavItems = () => {
    const items = filter(SIDE_NAV, e => e !== SIDE_NAV.SYSTEM_STATUS)
      .map(name => sideNavItem({
        id: name,
        onClick: () => this.selectSideNavItem(name),
        text: systemStatusI18nLabels[name],
        isActive: this.state.selectedSideNavItemName === name
      }));

    return [
      sideNavItem({
        id: SIDE_NAV.SYSTEM_STATUS,
        text: systemStatusI18nLabels[SIDE_NAV.SYSTEM_STATUS],
        navData: { items },
        isCategory: true
      })
    ];
  }

  renderUploadLicenseButton = (history, location) => (
    <EuiButton
      data-test-subj="sgUploadLicenseButton"
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
              (<CancelButton onClick={() => history.goBack()} />),
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
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerSuccessCallout: PropTypes.func.isRequired,
  onTriggerCustomFlyout: PropTypes.func.isRequired
};

export default SystemStatus;
