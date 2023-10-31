/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiPageContentBody,
  EuiTab,
  EuiTabs,
  EuiSpacer,
  EuiErrorBoundary,
} from '@elastic/eui';
import Alerts from '../Alerts';
import Watches from '../Watches';
import DefineWatch from '../DefineWatch';
import { DefineJsonWatch } from '../DefineJsonWatch';
import Accounts from '../Accounts';
import DefineAccount from '../DefineAccount';
import { DefineJsonAccount } from '../DefineJsonAccount';
import { Breadcrumbs } from '../../components';
import WatchAck from '../WatchAck';
import getBreadcrumb from './utils/getBreadcrumb';
import { APP_PATH, APP_NAME } from '../../utils/constants';

import { Context } from '../../Context';
import SignalsOperatorView from '../SignalsOperatorView';


const getSelectedTabId = (pathname) => {
  if (pathname.includes(APP_PATH.WATCHES)) return APP_PATH.WATCHES;
  if (pathname.includes(APP_PATH.ACCOUNTS)) return APP_PATH.ACCOUNTS;
  if (pathname.includes(APP_PATH.SIGNALS_OPERATOR_VIEW)) return APP_PATH.SIGNALS_OPERATOR_VIEW;
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
      {
        id: APP_PATH.SIGNALS_OPERATOR_VIEW,
        name: 'Operator View',
        route: APP_PATH.SIGNALS_OPERATOR_VIEW
      }
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

  onSelectedTabChanged = (route) => {
    const {
      location: { pathname: currPathname },
    } = this.props;
    if (!currPathname.includes(route)) {
      this.props.history.push(route);
    }
  };

  renderTab = (tab) => (
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
    const { history, ...props } = this.props;

    /*
      Drag And Drop (DND) functionality relies on <div id="searchguardDragAndDropPortalAnchor" />
      Because Eui accordion item visually brakes DND dragging capability applying transform.
      https://github.com/elastic/eui/issues/3548
    */
    return (
      <EuiPage id={APP_NAME}>
        <div id="searchguardDragAndDropPortalAnchor" />
        <EuiPageBody className="sg-container">
          <EuiPageHeader>
            <Breadcrumbs history={history} onGetBreadcrumb={getBreadcrumb} {...props} />
          </EuiPageHeader>

          <EuiPageContent>
            <EuiPageContentBody className="sg-page-content-body">
              <Switch>
                <Route
                  path={'/watch/:watchId/ack/:actionId?'}
                  exact
                  render={(props) => {
                    return <WatchAck {...props} />;
                  }}
                />
                <Route
                  exact
                  path={APP_PATH.WATCHES}
                  render={(props) => (
                    <EuiErrorBoundary>
                      <EuiTabs>{this.tabs.map(this.renderTab)}</EuiTabs>
                      <EuiSpacer />
                      <Watches {...props} />
                    </EuiErrorBoundary>
                  )}
                />
                <Route
                  path={APP_PATH.DEFINE_WATCH}
                  render={(props) => <DefineWatch {...props} />}
                />
                <Route
                  path={APP_PATH.DEFINE_JSON_WATCH}
                  render={(props) => <DefineJsonWatch {...props} />}
                />
                <Route path={APP_PATH.ALERTS} render={(props) => <Alerts {...props} />} />
                <Route
                  exact
                  path={APP_PATH.DASHBOARD}
                  render={(props) => (
                    <EuiErrorBoundary>
                      <EuiTabs>{this.tabs.map(this.renderTab)}</EuiTabs>
                      <EuiSpacer />
                      <Alerts {...props} />
                    </EuiErrorBoundary>
                  )}
                />
                <Route
                  path={APP_PATH.ACCOUNTS}
                  render={(props) => (
                    <EuiErrorBoundary>
                      <EuiTabs>{this.tabs.map(this.renderTab)}</EuiTabs>
                      <EuiSpacer />
                      <Accounts {...props} />
                    </EuiErrorBoundary>
                  )}
                />
                <Route
                  path={APP_PATH.DEFINE_ACCOUNT}
                  render={(props) => <DefineAccount {...props} />}
                />
                <Route
                  path={APP_PATH.DEFINE_JSON_ACCOUNT}
                  render={(props) => <DefineJsonAccount {...props} />}
                />
                <Route
                  exact
                  path={APP_PATH.SIGNALS_OPERATOR_VIEW}
                  render={(props) => (
                    <EuiErrorBoundary>
                      <EuiTabs>{this.tabs.map(this.renderTab)}</EuiTabs>
                      <EuiSpacer />
                      <SignalsOperatorView {...props} />
                    </EuiErrorBoundary>
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
};

export default Main;
