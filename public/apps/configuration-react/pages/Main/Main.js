import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { get } from 'lodash';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiPageContentBody,
  EuiText,
  EuiListGroup,
  EuiListGroupItem
} from '@elastic/eui';
import Home from '../Home';
import {
  InternalUsers,
  CreateInternalUser,
  Auth,
  SystemStatus,
  Tenants,
  CreateTenant,
  ActionGroups,
  CreateActionGroup
} from '../';
import { Breadcrumbs, Flyout, Callout } from '../../components';
import { APP_PATH, CALLOUTS, FLYOUTS } from '../../utils/constants';
import { checkIfLicenseValid } from '../../utils/helpers';
import { sgLicenseNotValidText } from '../../utils/i18n/common';
import '../../less/main.less';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      purgingCache: false,
      flyout: null,
      callout: null,
      sideNavItems: [],
      selectedSideNavItemName: undefined
    };
  }

  componentDidMount() {
    this.calloutErrorIfLicenseNotValid();
  }

  calloutErrorIfLicenseNotValid = () => {
    const { isValid, messages } = checkIfLicenseValid();
    if (!isValid) {
      this.handleTriggerCallout({
        type: CALLOUTS.ERROR_CALLOUT,
        payload: (
          <Fragment>
            <EuiText>
              <h3>{sgLicenseNotValidText}</h3>
            </EuiText>
            <EuiListGroup>
              {messages.map((message, i) => <EuiListGroupItem key={i} label={message} />)}
            </EuiListGroup>
          </Fragment>
        )
      });
    }
  }

  handleTriggerFlyout = flyout => {
    const { flyout: current } = this.state;
    const isSameFlyout = current && flyout && current.type === flyout.type;
    if (isSameFlyout) {
      this.setState({ flyout: null });
    } else {
      this.setState({ flyout });
    }
  }

  handleTriggerInspectJsonFlyout = payload => {
    this.handleTriggerFlyout({ type: FLYOUTS.INSPECT_JSON, payload });
  }

  handleTriggerCustomFlyout = payload => {
    this.handleTriggerFlyout({ type: FLYOUTS.CUSTOM, payload });
  }

  handleTriggerCallout = callout => {
    this.setState({ callout });
  }

  handleTriggerErrorCallout = error => {
    error = error.data || error;
    this.handleTriggerCallout({
      type: CALLOUTS.ERROR_CALLOUT,
      payload: get(error, 'message', error)
    });
  }

  handleTriggerSuccessCallout = payload => {
    this.handleTriggerCallout({ type: CALLOUTS.SUCCESS_CALLOUT, payload });
  }

  handlePurgeCache = async () => {
    this.setState({ purgingCache: true });
    try {
      await this.props.backendApiService.clearCache();
    } catch (error) {
      this.handleTriggerErrorCallout(error);
    }
    this.setState({ purgingCache: false });
  }

  render() {
    const {
      flyout,
      callout,
      purgingCache
    } = this.state;
    const {
      httpClient,
      angularServices: {
        internalUsersService,
        rolesService,
        configurationService,
        tenantsService,
        actionGroupsService
      },
      history,
      ...rest
    } = this.props;

    return (
      <EuiPage id="searchGuardKibanaPlugin">
        <EuiPageBody>
          <Flyout flyout={flyout} onClose={() => this.handleTriggerFlyout(null)} />

          <EuiPageHeader>
            <Breadcrumbs history={history} {...rest} />
          </EuiPageHeader>

          <EuiPageContent>
            <EuiPageContentBody>
              <Callout callout={callout} onClose={() => this.handleTriggerCallout(null)} />
              <Switch>
                <Route
                  path={APP_PATH.CREATE_INTERNAL_USER}
                  render={props => (
                    <CreateInternalUser
                      httpClient={httpClient}
                      internalUsersService={internalUsersService}
                      rolesService={rolesService}
                      onTriggerInspectJsonFlyout={this.handleTriggerInspectJsonFlyout}
                      onTriggerErrorCallout={this.handleTriggerErrorCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.INTERNAL_USERS}
                  render={props => (
                    <InternalUsers
                      httpClient={httpClient}
                      internalUsersService={internalUsersService}
                      onTriggerErrorCallout={this.handleTriggerErrorCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.AUTH}
                  render={props => (
                    <Auth
                      httpClient={httpClient}
                      configurationService={configurationService}
                      onTriggerErrorCallout={this.handleTriggerErrorCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.SYSTEM_STATUS}
                  render={props => (
                    <SystemStatus
                      httpClient={httpClient}
                      onTriggerErrorCallout={this.handleTriggerErrorCallout}
                      onTriggerSuccessCallout={this.handleTriggerSuccessCallout}
                      onTriggerCustomFlyout={this.handleTriggerCustomFlyout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.TENANTS}
                  render={props => (
                    <Tenants
                      httpClient={httpClient}
                      tenantsService={tenantsService}
                      onTriggerErrorCallout={this.handleTriggerErrorCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.CREATE_TENANT}
                  render={props => (
                    <CreateTenant
                      httpClient={httpClient}
                      tenantsService={tenantsService}
                      onTriggerErrorCallout={this.handleTriggerErrorCallout}
                      onTriggerInspectJsonFlyout={this.handleTriggerInspectJsonFlyout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.ACTION_GROUPS}
                  render={props => (
                    <ActionGroups
                      httpClient={httpClient}
                      actionGroupsService={actionGroupsService}
                      onTriggerErrorCallout={this.handleTriggerErrorCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.CREATE_ACTION_GROUP}
                  render={props => (
                    <CreateActionGroup
                      httpClient={httpClient}
                      actionGroupsService={actionGroupsService}
                      onTriggerErrorCallout={this.handleTriggerErrorCallout}
                      onTriggerInspectJsonFlyout={this.handleTriggerInspectJsonFlyout}
                      {...props}
                    />
                  )}
                />
                <Route
                  render={props => (
                    <Home
                      purgingCache={purgingCache}
                      onPurgeCache={this.handlePurgeCache}
                      {...props}
                    />
                  )}
                />
              </Switch>
            </EuiPageContentBody>
          </EuiPageContent>

        </EuiPageBody>
      </EuiPage>
    );
  }
}

Main.propTypes = {
  httpClient: PropTypes.func.isRequired,
  angularServices: PropTypes.shape({
    internalUsersService: PropTypes.object.isRequired,
    rolesService: PropTypes.object.isRequired,
    configurationService: PropTypes.object.isRequired,
    backendApiService: PropTypes.object.isRequired,
    tenantsService: PropTypes.object.isRequired,
    actionGroupsService: PropTypes.object.isRequired
  }),
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default Main;
