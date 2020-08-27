import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { I18nProvider } from '@kbn/i18n/react';
import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import Main from './pages/Main';
import { MainContextProvider } from './contexts/MainContextProvider';

import { HashRouter as Router, Route } from 'react-router-dom';

//import './css/style.css';

import { APP_NAME } from './utils/constants';

const app = uiModules.get('apps/searchguard-multitenancy');

app.config($locationProvider => {
  $locationProvider.html5Mode({
    enabled: false,
    requireBase: false,
    rewriteLinks: false,
  });
});

app.config(stateManagementConfigProvider =>
  stateManagementConfigProvider.disable()
);

function RootController($scope, $element, $http) {
  const domNode = $element[0];

  // render react to DOM
  render(
    <I18nProvider>
      <Router>
        <Route
          render={props => (
            <MainContextProvider httpClient={$http}>
              <Main
                title={APP_NAME}
                httpClient={$http}
                {...props}
              />
            </MainContextProvider>
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

chrome.setRootController(APP_NAME, RootController);
