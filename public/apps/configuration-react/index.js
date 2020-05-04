/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import { render, unmountComponentAtNode } from 'react-dom';
import { I18nProvider } from '@kbn/i18n/react';

import { ContextProvider } from './Context';

import 'ui/autoload/styles';
import Main from './pages/Main';

import './css/style.css';

const app = uiModules.get('apps/searchguardConfiguration');

app.config($locationProvider => {
  $locationProvider.html5Mode({
    enabled: false,
    requireBase: false,
    rewriteLinks: false,
  });
});

app.config(stateManagementConfigProvider => stateManagementConfigProvider.disable());

function RootController($scope, $element, $http) {
  const domNode = $element[0];

  // render react to DOM
  render(
    <I18nProvider>
      <Router>
        <Route
          render={props => (
            <ContextProvider httpClient={$http}>
              <Main title="Search Guard" httpClient={$http} {...props} />
            </ContextProvider>
          )}
        />
      </Router>
    </I18nProvider>,
    domNode
  );

  // unmount react on controller destroy
  $scope.$on('$destroy', () => {
    unmountComponentAtNode(domNode);
  });
}

chrome.setRootController('searchguardConfigurationReact', RootController);
