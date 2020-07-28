/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { get, differenceBy, isEmpty, map } from 'lodash';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiPageContentBody,
  EuiText,
  EuiListGroup,
  EuiListGroupItem,
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
  CreateRoleMapping,
} from '../';
import { Breadcrumbs, Flyout, Callout, Modal, LoadingPage } from '../../components';
import { APP_PATH, CALLOUTS, FLYOUTS, MODALS, LOCAL_STORAGE } from '../../utils/constants';
import { checkIfLicenseValid, comboBoxOptionsToArray } from '../../utils/helpers';
import {
  apiAccessStateForbiddenText,
  apiAccessStateNotEnabledText,
  sgLicenseNotValidText,
} from '../../utils/i18n/main';
import { API_ACCESS_STATE } from './utils/constants';
import { LocalStorageService, ApiService } from '../../services';
import getBreadcrumb from './utils/getBreadcrumb';

import { Context } from '../../Context';

class Main extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.localStorage = new LocalStorageService();
    this.apiService = new ApiService(this.props.httpClient);
    this.configService = context.configService;

    this.state = {
      purgingCache: false,
      flyout: null,
      callout: null,
      modal: null,
      sideNavItems: [],
      selectedSideNavItemName: undefined,
      apiAccessState: API_ACCESS_STATE.PENDING,
    };
  }

  componentDidMount() {
    this.checkAPIAccess();
    if (isEmpty(this.localStorage.cache)) this.localStorage.cache = LOCAL_STORAGE;
  }

  checkAPIAccess = async () => {
    try {
      if (!this.configService.restApiEnabled()) {
        this.handleTriggerErrorCallout({ message: apiAccessStateNotEnabledText });
      } else {
        if (!this.configService.hasApiAccess()) {
          this.handleTriggerErrorCallout({ message: apiAccessStateForbiddenText });
        } else {
          this.setState({ apiAccessState: API_ACCESS_STATE.OK });
        }
      }
      this.calloutErrorIfLicenseNotValid();
    } catch (error) {
      this.handleTriggerErrorCallout(error);
    }
  };

  calloutErrorIfLicenseNotValid = () => {
    const { isValid, messages } = checkIfLicenseValid(this.configService);
    if (!isValid) {
      this.handleTriggerCallout({
        type: CALLOUTS.ERROR_CALLOUT,
        payload: (
          <Fragment>
            <EuiText>
              <h3>{sgLicenseNotValidText}</h3>
            </EuiText>
            <EuiListGroup>
              {map(messages, (message, i) => (
                <EuiListGroupItem key={i} label={message} />
              ))}
            </EuiListGroup>
          </Fragment>
        ),
      });
    }
  };

  handleTriggerFlyout = flyout => {
    const { flyout: current } = this.state;
    const isSameFlyout = current && flyout && current.type === flyout.type;
    if (isSameFlyout) {
      this.setState({ flyout: null });
    } else {
      this.setState({ flyout });
    }
  };

  handleTriggerInspectJsonFlyout = payload => {
    if (payload === null) {
      this.handleTriggerFlyout(null);
    } else {
      this.handleTriggerFlyout({
        type: FLYOUTS.INSPECT_JSON,
        payload: { ...payload, editorTheme: this.context.editorTheme },
      });
    }
  };

  handleTriggerCustomFlyout = payload => {
    if (payload === null) {
      this.handleTriggerFlyout(null);
    } else {
      this.handleTriggerFlyout({ type: FLYOUTS.CUSTOM, payload });
    }
  };

  handleTriggerCallout = callout => {
    this.setState({ callout });
  };

  handleTriggerErrorCallout = error => {
    console.error(error);
    error = error.data || error.body || error;
    this.handleTriggerCallout({
      type: CALLOUTS.ERROR_CALLOUT,
      payload: get(error, 'message', error),
    });
  };

  handleTriggerSuccessCallout = payload => {
    this.handleTriggerCallout({ type: CALLOUTS.SUCCESS_CALLOUT, payload });
  };

  handleTriggerModal = modal => {
    this.setState({ modal });
  };

  handleTriggerConfirmDeletionModal = payload => {
    const modal = payload === null ? null : { type: MODALS.CONFIRM_DELETION, payload };
    this.handleTriggerModal(modal);
  };

  handlePurgeCache = async () => {
    this.setState({ purgingCache: true });
    try {
      await this.apiService.clearCache();
    } catch (error) {
      this.handleTriggerErrorCallout(error);
    }
    this.setState({ purgingCache: false });
  };

  handleComboBoxChange = validationFn => (options, field, form) => {
    const isValidationRequired = validationFn instanceof Function;
    if (isValidationRequired) {
      const error = validationFn(options);
      if (error instanceof Promise) {
        error
          .then(_error => {
            throw _error;
          })
          .catch(_error => form.setFieldError(field.name, _error));
      } else {
        form.setFieldError(field.name, error);
      }
    }

    const isDeleting = options.length < field.value.length;
    if (isDeleting) {
      const optionToDelete = comboBoxOptionsToArray(
        differenceBy(field.value, options, 'label')
      ).join(', ');
      this.handleTriggerConfirmDeletionModal({
        body: optionToDelete,
        onConfirm: () => {
          form.setFieldValue(field.name, options);
          this.handleTriggerConfirmDeletionModal(null);
        },
      });
    } else {
      form.setFieldValue(field.name, options);
    }
  };

  handleComboBoxCreateOption = (validationFn, ...props) => async (label, field, form) => {
    let isValid = true;
    const isValidationRequired = validationFn instanceof Function;
    if (isValidationRequired) {
      const _isValid = validationFn(label, ...props);
      if (_isValid instanceof Promise) {
        await _isValid
          .then(_error => {
            throw _error;
          })
          .catch(_error => (isValid = _error));
      } else {
        isValid = _isValid;
      }
    }

    if (isValid) {
      const normalizedSearchValue = label.trim().toLowerCase();
      if (!normalizedSearchValue) return;
      form.setFieldValue(field.name, field.value.concat({ label }));
    }
  };

  handleComboBoxOnBlur = (e, field, form) => {
    form.setFieldTouched(field.name, true);
  };

  render() {
    const { flyout, callout, purgingCache, modal, apiAccessState } = this.state;
    const { httpClient, history, ...rest } = this.props;

    const isAPIAccessPending = apiAccessState === API_ACCESS_STATE.PENDING;
    const isAPIAccessOk = apiAccessState === API_ACCESS_STATE.OK;

    return (
      <EuiPage id="searchGuardKibanaPlugin">
        <EuiPageBody className="container">
          <Flyout flyout={flyout} onClose={() => this.handleTriggerFlyout(null)} />

          <EuiPageHeader>
            <Breadcrumbs history={history} onGetBreadcrumb={getBreadcrumb} {...rest} />
          </EuiPageHeader>

          <EuiPageContent>
            <EuiPageContentBody>
              <Callout callout={callout} onClose={() => this.handleTriggerCallout(null)} />
              <Modal modal={modal} onClose={() => this.handleTriggerModal(null)} />
              {isAPIAccessPending && LoadingPage}
              {isAPIAccessOk && (
                <Switch>
                  <Route
                    path={APP_PATH.CREATE_INTERNAL_USER}
                    render={props => (
                      <CreateInternalUser
                        httpClient={httpClient}
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
                        onTriggerErrorCallout={this.handleTriggerErrorCallout}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    path={APP_PATH.ROLES}
                    render={props => (
                      <Roles
                        httpClient={httpClient}
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
                        httpClient={httpClient}
                        purgingCache={purgingCache}
                        onPurgeCache={this.handlePurgeCache}
                        {...props}
                      />
                    )}
                  />
                </Switch>
              )}
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}

Main.propTypes = {
  httpClient: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default Main;
