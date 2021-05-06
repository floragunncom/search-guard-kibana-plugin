/* eslint-disable @kbn/eslint/require-license-header */
/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiSideNav,
  EuiFlexGrid,
  EuiCodeEditor,
  EuiText,
} from '@elastic/eui';
import { ContentPanel, CancelButton } from '../../components';
import { get, isEmpty, map, toString, startCase } from 'lodash';
import { APP_PATH } from '../../utils/constants';
import { stringifyPretty } from '../../utils/helpers';
import { navigateText } from '../../utils/i18n/common';
import { SELECTED_SIDE_NAV_ITEM_NAME } from './utils/constants';
import { resourcesToUiResources, getSideNavItems } from './utils';
import { SgConfigService } from '../../services';

import { Context } from '../../Context';

const AuthContent = ({ resource }) => (
  <EuiFlexGrid columns={2} className="sgFixedFormGroupItem">
    {map(resource, (value, key) => (
      <Fragment key={key}>
        <EuiFlexItem>
          <EuiText data-test-subj={`sgAuthContentKey-${key}`}>{startCase(key)}</EuiText>
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

export class Auth extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.state = {
      resources: {},
      isLoading: true,
      selectedSideNavItemName: SELECTED_SIDE_NAV_ITEM_NAME,
      isSideNavOpenOnMobile: false,
    };

    this.backendService = new SgConfigService(context.httpClient);
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
          authz: get(data, 'sg_config.dynamic.authz', {}),
        }),
      });
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

  selectSideNavItem = selectedSideNavItemName => {
    this.setState({ selectedSideNavItemName });
  };

  getResource = resource => {
    if (isEmpty(resource)) return {};
    const common = {
      enabledOnREST: resource.http_enabled,
      enabledOnTransport: resource.transport_enabled,
    };

    if (resource.resourceType === 'authc') {
      return {
        ...common,
        HTTPAuthenticationType: resource.http_authenticator.type,
        HTTPChallenge: resource.http_authenticator.challenge,
        HTTPAuthenticatorConfiguration: this.renderCodeEditor(
          stringifyPretty(resource.http_authenticator.config)
        ),
        authenticationBackendType: resource.authentication_backend.type,
        authenticationBackendConfiguration: this.renderCodeEditor(
          stringifyPretty(resource.authentication_backend.config)
        ),
      };
    }

    return {
      ...common,
      authorizationBackendType: resource.authorization_backend.type,
      authorizationBackendConfiguration: this.renderCodeEditor(
        stringifyPretty(resource.authorization_backend.config)
      ),
    };
  };

  renderCodeEditor = value => (
    <EuiCodeEditor
      isReadOnly
      width="100%"
      setOptions={{
        minLines: 10,
        maxLines: 15,
        fontSize: '12px',
      }}
      theme={this.context.editorTheme}
      value={value}
    />
  );

  render() {
    const { history } = this.props;
    const { selectedSideNavItemName, resources, isSideNavOpenOnMobile } = this.state;

    const sideNavItems = getSideNavItems({
      resources,
      selectedSideNavItemName: this.state.selectedSideNavItemName,
      onSelectSideNavItem: this.selectSideNavItem.bind(this),
    });

    const resource = this.getResource(resources[selectedSideNavItemName]);

    return (
      <EuiFlexGroup data-test-subj="sgConfiguration-Auth">
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
            title={startCase(selectedSideNavItemName)}
            actions={[<CancelButton onClick={() => history.push(APP_PATH.HOME)} />]}
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
};
