import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import { render, unmountComponentAtNode } from 'react-dom';
import { I18nProvider } from '@kbn/i18n/react';

import 'ui/autoload/styles';
import Main from './pages/Main';

// TODO: delete these services imports after they are refactored to JS/React
import '../configuration/backend_api/actiongroups';
import '../configuration/backend_api/client';
import '../configuration/backend_api/internalusers';
import '../configuration/backend_api/roles';
import '../configuration/backend_api/rolesmapping';
import '../configuration/backend_api/sgconfiguration';

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
  backendInternalUsers,
  backendRoles,
  sgConfiguration
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
            backendRoles={backendRoles}
            sgConfiguration={sgConfiguration}
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
