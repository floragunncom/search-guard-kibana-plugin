import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { get, differenceBy } from 'lodash';
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
  CreateActionGroup,
  Roles,
  CreateRole,
  RoleMappings,
  CreateRoleMapping
} from '../';
import { Breadcrumbs, Flyout, Callout, Modal, LoadingPage } from '../../components';
import { APP_PATH, CALLOUTS, FLYOUTS, MODALS } from '../../utils/constants';
import { checkIfLicenseValid, comboBoxOptionsToArray } from '../../utils/helpers';
import {
  apiAccessStateForbiddenText,
  apiAccessStateNotEnabledText,
  sgLicenseNotValidText
} from '../../utils/i18n/main';
import { API_ACCESS_STATE } from './utils/constants';
import '../../less/main.less';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      purgingCache: false,
      flyout: null,
      callout: null,
      modal: null,
      sideNavItems: [],
      selectedSideNavItemName: undefined,
      apiAccessState: API_ACCESS_STATE.PENDING
    };
  }

  componentDidMount() {
    this.calloutErrorIfLicenseNotValid();
    this.checkAPIAccess();
  }

  checkAPIAccess = async () => {
    const { systemstateService } = this.props.angularServices;
    try {
      await systemstateService.loadSystemInfo();
      if (!systemstateService.restApiEnabled()) {
        this.handleTriggerErrorCallout({ message: apiAccessStateNotEnabledText });
      } else {
        await systemstateService.loadRestInfo();
        if (!systemstateService.hasApiAccess()) {
          this.handleTriggerErrorCallout({ message: apiAccessStateForbiddenText });
        } else {
          this.setState({ apiAccessState: API_ACCESS_STATE.OK });
        }
      }
    } catch (error) {
      this.handleTriggerErrorCallout(error);
    }
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
    console.error(error);
  }

  handleTriggerSuccessCallout = payload => {
    this.handleTriggerCallout({ type: CALLOUTS.SUCCESS_CALLOUT, payload });
  }

  handleTriggerModal = modal => {
    this.setState({ modal });
  }

  handleTriggerConfirmDeletionModal = payload => {
    const modal = payload === null ? null : { type: MODALS.CONFIRM_DELETION, payload };
    this.handleTriggerModal(modal);
  }

  handlePurgeCache = async () => {
    this.setState({ purgingCache: true });
    const { backendApiService } = this.props.angularServices;
    try {
      await backendApiService.clearCache();
    } catch (error) {
      this.handleTriggerErrorCallout(error);
    }
    this.setState({ purgingCache: false });
  }

  handleComboBoxChange = validationFn => (options, field, form) => {
    const isValidationRequired = validationFn instanceof Function;
    if (isValidationRequired) {
      const error = validationFn(options);
      if (error instanceof Promise) {
        error
          .then(_error => { throw _error; })
          .catch(_error => form.setFieldError(field.name, _error));
      } else {
        form.setFieldError(field.name, error);
      }
    }

    const isDeleting = options.length < field.value.length;
    if (isDeleting) {
      const optionToDelete = comboBoxOptionsToArray(differenceBy(field.value, options, 'label')).join(', ');
      this.handleTriggerConfirmDeletionModal({
        body: optionToDelete,
        onConfirm: () => {
          form.setFieldValue(field.name, options);
          this.handleTriggerConfirmDeletionModal(null);
        }
      });
    } else {
      form.setFieldValue(field.name, options);
    }
  }

  handleComboBoxCreateOption = (validationFn, ...props) => async (label, field, form) => {
    let isValid = true;
    const isValidationRequired = validationFn instanceof Function;
    if (isValidationRequired) {
      const _isValid = validationFn(label, ...props);
      if (_isValid instanceof Promise) {
        await _isValid
          .then(_error => { throw _error; })
          .catch(_error => isValid = _error);
      } else {
        isValid = _isValid;
      }
    }

    if (isValid) {
      const normalizedSearchValue = label.trim().toLowerCase();
      if (!normalizedSearchValue) return;
      form.setFieldValue(field.name, field.value.concat({ label }));
    }
  }

  handleComboBoxOnBlur = (e, field, form) => {
    form.setFieldTouched(field.name, true);
  }

  render() {
    const {
      flyout,
      callout,
      purgingCache,
      modal,
      apiAccessState
    } = this.state;
    const {
      httpClient,
      angularServices: {
        internalUsersService,
        rolesService,
        configurationService,
        tenantsService,
        actionGroupsService,
        roleMappingsService,
        systemstateService
      },
      history,
      ...rest
    } = this.props;

    const isAPIAccessPending = apiAccessState === API_ACCESS_STATE.PENDING;
    const isAPIAccessOk = apiAccessState === API_ACCESS_STATE.OK;

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
              <Modal modal={modal} onClose={() => this.handleTriggerModal(null)} />
              {isAPIAccessPending && LoadingPage}
              {isAPIAccessOk &&
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
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                        onComboBoxChange={this.handleComboBoxChange}
                        onComboBoxOnBlur={this.handleComboBoxOnBlur}
                        onComboBoxCreateOption={this.handleComboBoxCreateOption}
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
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
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
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
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
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
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
                        onComboBoxChange={this.handleComboBoxChange}
                        onComboBoxOnBlur={this.handleComboBoxOnBlur}
                        onComboBoxCreateOption={this.handleComboBoxCreateOption}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    path={APP_PATH.ROLES}
                    render={props => (
                      <Roles
                        httpClient={httpClient}
                        rolesService={rolesService}
                        onTriggerErrorCallout={this.handleTriggerErrorCallout}
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    path={APP_PATH.CREATE_ROLE}
                    render={props => (
                      <CreateRole
                        httpClient={httpClient}
                        rolesService={rolesService}
                        roleMappingsService={roleMappingsService}
                        actionGroupsService={actionGroupsService}
                        systemstateService={systemstateService}
                        tenantsService={tenantsService}
                        onTriggerErrorCallout={this.handleTriggerErrorCallout}
                        onTriggerInspectJsonFlyout={this.handleTriggerInspectJsonFlyout}
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                        onComboBoxChange={this.handleComboBoxChange}
                        onComboBoxOnBlur={this.handleComboBoxOnBlur}
                        onComboBoxCreateOption={this.handleComboBoxCreateOption}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    path={APP_PATH.ROLE_MAPPINGS}
                    render={props => (
                      <RoleMappings
                        httpClient={httpClient}
                        rolesService={rolesService}
                        roleMappingsService={roleMappingsService}
                        onTriggerErrorCallout={this.handleTriggerErrorCallout}
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    path={APP_PATH.CREATE_ROLE_MAPPING}
                    render={props => (
                      <CreateRoleMapping
                        httpClient={httpClient}
                        roleMappingsService={roleMappingsService}
                        internalUsersService={internalUsersService}
                        rolesService={rolesService}
                        onTriggerErrorCallout={this.handleTriggerErrorCallout}
                        onTriggerInspectJsonFlyout={this.handleTriggerInspectJsonFlyout}
                        onComboBoxChange={this.handleComboBoxChange}
                        onComboBoxOnBlur={this.handleComboBoxOnBlur}
                        onComboBoxCreateOption={this.handleComboBoxCreateOption}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    render={props => (
                      <Home
                        systemstateService={systemstateService}
                        purgingCache={purgingCache}
                        onPurgeCache={this.handlePurgeCache}
                        {...props}
                      />
                    )}
                  />
                </Switch>
              }
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
    actionGroupsService: PropTypes.object.isRequired,
    roleMappingsService: PropTypes.object.isRequired,
    systemstateService: PropTypes.object.isRequired
  }),
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default Main;
