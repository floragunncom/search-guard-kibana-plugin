/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiIcon,
  EuiFlexItem,
  EuiFlexGroup,
  EuiSideNav,
  EuiButton,
  EuiTextColor,
  EuiFlexGrid
} from '@elastic/eui';
import { ContentPanel } from '../../components';
import { get, isEmpty, map, forEach } from 'lodash';
import { APP_PATH } from '../../utils/constants';
import { stringifyPretty } from '../../utils/helpers';
import { navigateText, cancelText, disabledText } from '../../utils/i18n/common';
import * as authI18nLabels from '../../utils/i18n/auth';
import { SELECTED_SIDE_NAV_ITEM_NAME } from './utils/constants';
import { resourcesToUiResources } from './utils';

const AuthContent = ({ resource }) => (
  <EuiFlexGrid columns={2}>
    {map(resource, (value, key) => (
      <Fragment key={key}>
        <EuiFlexItem>
          {authI18nLabels[key]}
        </EuiFlexItem>
        <EuiFlexItem>
          <pre><code>{value.toString()}</code></pre>
        </EuiFlexItem>
      </Fragment>
    ))}
  </EuiFlexGrid>
);

// Move nav item names to i18n
class Auth extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: {},
      isLoading: true,
      selectedSideNavItemName: SELECTED_SIDE_NAV_ITEM_NAME,
      isSideNavOpenOnMobile: false
    };

    this.backendService = this.props.configurationService;
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      this.setState({ isLoading: true });
      const { data } = await this.backendService.list();
      this.setState({
        resources: resourcesToUiResources({
          authc: get(data, 'sg_config.dynamic.authc', {}),
          authz: get(data, 'sg_config.dynamic.authz', {})
        })
      });
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

  createSideNavItem = (name, navData = {}) => {
    return {
      onClick: () => this.selectSideNavItem(name),
      ...navData,
      id: name,
      name: authI18nLabels[name],
      isSelected: this.state.selectedSideNavItemName === name
    };
  };

  getSideNavItems = resources => {
    const sideNavItems = [];
    if (isEmpty(resources)) return sideNavItems;

    const authcItems = [];
    const authzItems = [];

    forEach(resources, resource => {
      const navItem = this.createSideNavItem(resource.name, { order: resource.order });

      if (resource.resourceType === 'authc') {
        authcItems.push(navItem);
      } else {
        authzItems.push(navItem);
      }
    });

    sideNavItems.push(
      this.createSideNavItem('authentication', {
        icon: <EuiIcon type="securityAnalyticsApp"/>,
        items: authcItems.sort((a, b) => a.order - b.order),
        onClick: () => undefined
      })
    );

    sideNavItems.push(
      this.createSideNavItem('authorization', {
        icon: <EuiIcon type="securityApp"/>,
        items: authzItems.sort((a, b) => a.order - b.order),
        onClick: () => undefined
      })
    );

    return sideNavItems;
  }

  getResource = resource => {
    if (isEmpty(resource)) return {};
    const common = {
      enaledOnREST: resource.http_enabled,
      enabledOnTransport: resource.transport_enabled,
    };

    if (resource.resourceType === 'authc') {
      return {
        ...common,
        HTTPAuthenticationType: resource.http_authenticator.type,
        HTTPChallenge: resource.http_authenticator.challenge,
        HTTPAuthenticatorConfiguration: stringifyPretty(resource.http_authenticator.config),
        authenticationBackendType: resource.authentication_backend.type,
        authenticationBackendConfiguration: stringifyPretty(resource.authentication_backend.config)
      };
    }

    return {
      ...common,
      authorizationBackendType: resource.authorization_backend.type,
      authorizationBackendConfiguration: stringifyPretty(resource.authorization_backend.config)
    };
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.HOME)}>
      {cancelText}
    </EuiButton>
  )

  renderPanelTitle = selectedSideNavItemName => {
    const disabled = !isEmpty(this.state.resources) &&
      !this.state.resources[selectedSideNavItemName].transport_enabled;

    return (
      <Fragment>
        {authI18nLabels[selectedSideNavItemName]} {disabled &&
          <EuiTextColor color="danger">{disabledText}</EuiTextColor>
        }
      </Fragment>
    );
  }

  render() {
    const { history } = this.props;
    const { selectedSideNavItemName, resources, isSideNavOpenOnMobile } = this.state;
    const sideNavItems = this.getSideNavItems(resources);
    const resource = this.getResource(resources[selectedSideNavItemName]);

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
            title={this.renderPanelTitle(selectedSideNavItemName)}
            actions={[
              this.renderCancelButton(history),
            ]}
          >
            <AuthContent resource={resource} />
          </ContentPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

Auth.propTypes = {
  history: PropTypes.object.isRequired,
  httpClient: PropTypes.func,
  configurationService: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default Auth;
