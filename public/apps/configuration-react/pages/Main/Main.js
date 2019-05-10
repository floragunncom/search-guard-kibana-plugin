import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
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
import { CreateInternalUser } from '../CreateInternalUser';
import { InternalUsers } from '../InternalUsers';
import { Auth } from '../Auth';
import { SystemStatus } from '../SystemStatus';
import { Breadcrumbs, Flyout, Callout } from '../../components';
import { APP_PATH, CALLOUTS } from '../../utils/constants';
import { checkIfLicenseValid } from '../../utils/helpers';
import { sgLicenseNotValidText } from '../../utils/i18n/common';
import '../../less/main.less';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
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

  handleTriggerCallout = callout => {
    this.setState({ callout });
  }

  render() {
    const {
      flyout,
      callout
    } = this.state;
    const {
      httpClient,
      backendInternalUsers,
      backendRoles,
      sgConfiguration,
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
                      internalUsersService={backendInternalUsers}
                      rolesService={backendRoles}
                      onTriggerFlyout={this.handleTriggerFlyout}
                      onTriggerCallout={this.handleTriggerCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.INTERNAL_USERS}
                  render={props => (
                    <InternalUsers
                      httpClient={httpClient}
                      internalUsersService={backendInternalUsers}
                      onTriggerCallout={this.handleTriggerCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.AUTH}
                  render={props => (
                    <Auth
                      httpClient={httpClient}
                      configurationService={sgConfiguration}
                      onTriggerCallout={this.handleTriggerCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.SYSTEM_STATUS}
                  render={props => (
                    <SystemStatus
                      httpClient={httpClient}
                      onTriggerFlyout={this.handleTriggerFlyout}
                      onTriggerCallout={this.handleTriggerCallout}
                      {...props}
                    />
                  )}
                />
                <Route
                  render={props => <Home {...props} />}
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
  backendInternalUsers: PropTypes.object.isRequired,
  backendRoles: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default Main;
