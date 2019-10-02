import React from 'react';
import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import { render, unmountComponentAtNode } from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { camelCase } from 'lodash';
import { I18nProvider } from '@kbn/i18n/react';
import { APP_NAME } from './utils/constants';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './redux/reducers';

import '@elastic/eui/dist/eui_theme_light.css';
import 'react-vis/dist/style.css';
import 'ui/autoload/styles';
import Main from './pages/Main';

import './css/style.css';

// AngularJS doesn't like "-" char in the app name
const app = uiModules.get(`apps/${camelCase(APP_NAME)}`);

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
  const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  // render react to DOM
  render(
    <I18nProvider>
      <Router>
        <Route render={props => (
          <Provider store={store}>
            <Main title={camelCase(APP_NAME)} httpClient={$http} {...props} />
          </Provider>
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

chrome.setRootController(camelCase(APP_NAME), RootController);
