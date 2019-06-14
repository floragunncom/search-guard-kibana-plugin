/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiSideNav,
  EuiTextColor,
  EuiFlexGrid,
  EuiCodeEditor,
  EuiText
} from '@elastic/eui';
import { ContentPanel } from '../../components';
import { CancelButton } from '../../components/ContentPanel/components';
import { get, isEmpty, map, forEach, toString } from 'lodash';
import { APP_PATH } from '../../utils/constants';
import { stringifyPretty, sideNavItem } from '../../utils/helpers';
import { navigateText, disabledText } from '../../utils/i18n/common';
import * as authI18nLabels from '../../utils/i18n/auth';
import { SELECTED_SIDE_NAV_ITEM_NAME, SIDE_NAV } from './utils/constants';
import { resourcesToUiResources } from './utils';

const AuthContent = ({ resource }) => (
  <EuiFlexGrid columns={2} className="sgFixedFormGroupItem">
    {map(resource, (value, key) => (
      <Fragment key={key}>
        <EuiFlexItem>
          <EuiText data-test-subj={`sgAuthContentKey-${key}`}>
            {authI18nLabels[key]}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          {React.isValidElement(value) ? (
            <div data-test-subj={`sgAuthContentValue-${key}`}>{value}</div>
          ) : (
            <EuiText data-test-subj={`sgAuthContentValue-${key}`}>{toString(value)}</EuiText>
          )}
        </EuiFlexItem>
      </Fragment>
    ))}
  </EuiFlexGrid>
);

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

  getSideNavItems = resources => {
    const sideNavItems = [];
    if (isEmpty(resources)) return sideNavItems;

    const authcItems = [];
    const authzItems = [];

    forEach(resources, ({ name, order, resourceType }) => {
      const isCategory = name === SIDE_NAV.AUTHORIZATION || name === SIDE_NAV.AUTHENTICATION;
      const isActive = this.state.selectedSideNavItemName === name;
      const navItem = sideNavItem({
        id: name,
        text: authI18nLabels[name],
        navData: { order },
        isCategory,
        isActive,
        onClick: () => this.selectSideNavItem(name)
      });

      if (resourceType === 'authc') {
        authcItems.push(navItem);
      } else {
        authzItems.push(navItem);
      }
    });

    sideNavItems.push(
      sideNavItem({
        id: SIDE_NAV.AUTHENTICATION,
        text: authI18nLabels[SIDE_NAV.AUTHENTICATION],
        navData: {
          items: authcItems.sort((a, b) => a.order - b.order)
        },
        isCategory: true
      })
    );

    sideNavItems.push(
      sideNavItem({
        id: SIDE_NAV.AUTHORIZATION,
        text: authI18nLabels[SIDE_NAV.AUTHORIZATION],
        navData: {
          items: authzItems.sort((a, b) => a.order - b.order),
        },
        isCategory: true
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
        HTTPAuthenticatorConfiguration: this.renderCodeEditor(stringifyPretty(resource.http_authenticator.config)),
        authenticationBackendType: resource.authentication_backend.type,
        authenticationBackendConfiguration: this.renderCodeEditor(stringifyPretty(resource.authentication_backend.config))
      };
    }

    return {
      ...common,
      authorizationBackendType: resource.authorization_backend.type,
      authorizationBackendConfiguration: this.renderCodeEditor(stringifyPretty(resource.authorization_backend.config))
    };
  }

  renderCodeEditor = value => (
    <EuiCodeEditor
      isReadOnly
      width="100%"
      setOptions={{
        minLines: 10,
        maxLines: 15,
        fontSize: '12px'
      }}
      value={value}
    />
  )

  renderPanelTitle = selectedSideNavItemName => {
    const disabled = !isEmpty(this.state.resources) &&
      !this.state.resources[selectedSideNavItemName].transport_enabled;

    return (
      <Fragment>
        {authI18nLabels[selectedSideNavItemName]} {disabled &&
          <EuiTextColor
            data-test-subj="sgAuthContentPanelDisabledTag"
            color="danger"
          >
            {disabledText}
          </EuiTextColor>
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
              (<CancelButton onClick={() => history.push(APP_PATH.HOME)} />)
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
