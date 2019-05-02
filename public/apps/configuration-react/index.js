import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import { render, unmountComponentAtNode } from 'react-dom';
import { I18nProvider } from '@kbn/i18n/react';

import 'ui/autoload/styles';
import Main from './pages/Main';

// TODO: delete these services imports after they are refactored to JS/React
import './services/actiongroups';
import './services/client';
import './services/internalusers';
import './services/roles';
import './services/rolesmapping';
import './services/sgconfiguration';

const app = uiModules.get('apps/searchguardConfiguration');

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

function RootController(
  $scope,
  $element,
  $http,
  backendInternalUsers
) {
  const domNode = $element[0];

  // render react to DOM
  render(
    <I18nProvider>
      <Router>
        <Route render={props => (
          <Main
            title="Search Guard"
            httpClient={$http}
            backendInternalUsers={backendInternalUsers}
            {...props}
          />
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
