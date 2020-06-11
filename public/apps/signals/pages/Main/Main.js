/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import { differenceBy } from 'lodash';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiPageContentBody,
  EuiTab,
  EuiTabs,
  EuiSpacer,
} from '@elastic/eui';
import Alerts from '../Alerts';
import Watches from '../Watches';
import DefineWatch from '../DefineWatch';
import Accounts from '../Accounts';
import DefineAccount from '../DefineAccount';
import { Flyout, Modal, Breadcrumbs } from '../../components';
import getBreadcrumb from './utils/getBreadcrumb';
import { comboBoxOptionsToArray } from '../../utils/helpers';
import { APP_PATH, FLYOUTS, MODALS, APP_NAME } from '../../utils/constants';

import { Context } from '../../Context';

const getSelectedTabId = pathname => {
  if (pathname.includes(APP_PATH.WATCHES)) return APP_PATH.WATCHES;
  if (pathname.includes(APP_PATH.ACCOUNTS)) return APP_PATH.ACCOUNTS;
  return APP_PATH.WATCHES;
};

class Main extends Component {
  static contextType = Context;

  constructor(props) {
    super(props);
    const {
      location: { pathname },
    } = this.props;
    const selectedTabId = getSelectedTabId(pathname);

    this.state = {
      modal: null,
      flyout: null,
      selectedTabId,
    };

    this.tabs = [
      {
        id: APP_PATH.WATCHES,
        name: 'Watches',
        route: APP_PATH.WATCHES,
      },
      {
        id: APP_PATH.ACCOUNTS,
        name: 'Accounts',
        route: APP_PATH.ACCOUNTS,
      },
    ];
  }

  componentDidUpdate(prevProps) {
    const {
      location: { pathname: prevPathname },
    } = prevProps;
    const {
      location: { pathname: currPathname },
    } = this.props;
    if (prevPathname !== currPathname) {
      const selectedTabId = getSelectedTabId(currPathname);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ selectedTabId });
    }
  }

  onSelectedTabChanged = route => {
    const {
      location: { pathname: currPathname },
    } = this.props;
    if (!currPathname.includes(route)) {
      this.props.history.push(route);
    }
  };

  // TODO. Deprecate and use a method from ContextProvider
  // when all children use Context
  handleTriggerFlyout = flyout => {
    const { flyout: current } = this.state;
    const isSameFlyout = current && flyout && current.type === flyout.type;
    if (isSameFlyout) {
      this.setState({ flyout: null });
    } else {
      this.setState({ flyout });
    }
  };

  // TODO. Deprecate and use a method from ContextProvider
  // when all children use Context
  handleTriggerInspectJsonFlyout = (payload = {}) => {
    if (payload === null) {
      this.handleTriggerFlyout(null);
    } else {
      this.handleTriggerFlyout({
        type: FLYOUTS.INSPECT_JSON,
        payload: { ...payload, editorTheme: this.context.editorTheme },
      });
    }
  };

  // TODO. Deprecate and use a method from ContextProvider
  // when all children use Context
  handleTriggerModal = modal => {
    this.setState({ modal });
  };

  // TODO. Deprecate and use a method from ContextProvider
  // when all children use Context
  handleTriggerConfirmModal = payload => {
    const modal = payload === null ? null : { type: MODALS.CONFIRM, payload };
    this.handleTriggerModal(modal);
  };

  // TODO. Deprecate and use a method from ContextProvider
  // when all children use Context
  handleTriggerConfirmDeletionModal = payload => {
    const modal = payload === null ? null : { type: MODALS.CONFIRM_DELETION, payload };
    this.handleTriggerModal(modal);
  };

  // TODO. Deprecate and use a method from ContextProvider
  // when all children use Context
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

    const isDeleting = field.value && options.length < field.value.length;
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

  // TODO. Deprecate and use a method from ContextProvider
  // when all children use Context
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

  // TODO. Deprecate and use a method from ContextProvider
  // when all children use Context
  handleComboBoxOnBlur = (e, field, form) => {
    form.setFieldTouched(field.name, true);
  };

  renderTab = tab => (
    <EuiTab
      data-test-subj={`sgTab-${tab.id}`}
      onClick={() => this.onSelectedTabChanged(tab.route)}
      isSelected={tab.id === this.state.selectedTabId}
      key={tab.id}
    >
      {tab.name}
    </EuiTab>
  );

  render() {
    const { httpClient, history, ...props } = this.props;
    const { flyout, modal } = this.state;

    /*
      Drag And Drop (DND) functionality relies on <div id="searchguardDragAndDropPortalAnchor" />
      Because Eui accordion item visually brakes DND dragging capability applying transform.
      https://github.com/elastic/eui/issues/3548
    */
    return (
      <EuiPage id={APP_NAME}>
        <div id="searchguardDragAndDropPortalAnchor" />
        <EuiPageBody className="sg-container">
          <Flyout flyout={flyout} onClose={() => this.handleTriggerFlyout(null)} />

          <EuiPageHeader>
            <Breadcrumbs history={history} onGetBreadcrumb={getBreadcrumb} {...props} />
          </EuiPageHeader>

          <EuiPageContent>
            <EuiPageContentBody className="sg-page-content-body">
              <Modal modal={modal} onClose={() => this.handleTriggerModal(null)} />
              <Switch>
                <Route
                  exact
                  path={APP_PATH.WATCHES}
                  render={props => (
                    <Fragment>
                      <EuiTabs>{this.tabs.map(this.renderTab)}</EuiTabs>
                      <EuiSpacer />
                      <Watches
                        httpClient={httpClient}
                        onTriggerFlyout={this.handleTriggerFlyout}
                        onTriggerConfirmModal={this.handleTriggerConfirmModal}
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                        {...props}
                      />
                    </Fragment>
                  )}
                />
                <Route
                  path={APP_PATH.DEFINE_WATCH}
                  render={props => (
                    <DefineWatch
                      httpClient={httpClient}
                      onComboBoxChange={this.handleComboBoxChange}
                      onComboBoxOnBlur={this.handleComboBoxOnBlur}
                      onComboBoxCreateOption={this.handleComboBoxCreateOption}
                      onTriggerFlyout={this.handleTriggerFlyout}
                      onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                      {...props}
                    />
                  )}
                />
                <Route
                  path={APP_PATH.ALERTS}
                  render={props => (
                    <Alerts
                      httpClient={httpClient}
                      onTriggerInspectJsonFlyout={this.handleTriggerInspectJsonFlyout}
                      onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                      {...props}
                    />
                  )}
                />
                <Route
                  exact
                  path={APP_PATH.DASHBOARD}
                  render={props => (
                    <Fragment>
                      <EuiTabs>{this.tabs.map(this.renderTab)}</EuiTabs>
                      <EuiSpacer />
                      <Alerts
                        httpClient={httpClient}
                        onTriggerInspectJsonFlyout={this.handleTriggerInspectJsonFlyout}
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                        {...props}
                      />
                    </Fragment>
                  )}
                />
                <Route
                  path={APP_PATH.ACCOUNTS}
                  render={props => (
                    <Fragment>
                      <EuiTabs>{this.tabs.map(this.renderTab)}</EuiTabs>
                      <EuiSpacer />
                      <Accounts
                        httpClient={httpClient}
                        onTriggerConfirmDeletionModal={this.handleTriggerConfirmDeletionModal}
                        {...props}
                      />
                    </Fragment>
                  )}
                />
                <Route
                  path={APP_PATH.DEFINE_ACCOUNT}
                  render={props => (
                    <DefineAccount
                      httpClient={httpClient}
                      onComboBoxChange={this.handleComboBoxChange}
                      onComboBoxOnBlur={this.handleComboBoxOnBlur}
                      onComboBoxCreateOption={this.handleComboBoxCreateOption}
                      {...props}
                    />
                  )}
                />
                <Redirect to={APP_PATH.WATCHES} />
              </Switch>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}

Main.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired,
};

export default Main;
