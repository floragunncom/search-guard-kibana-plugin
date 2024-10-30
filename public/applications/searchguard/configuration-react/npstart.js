/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import Main from './pages/Main';
import { KibanaThemeProvider } from '@kbn/react-kibana-context-theme';

import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n-react';

import { ContextProvider } from './Context';

import './style.scss';

export const renderApp = ({
  httpClient,
  element,
  core,
  configService,
  removeExternalHistoryListener,
  theme$
}) => {
  ReactDOM.render(
    <I18nProvider>
      <KibanaThemeProvider theme={{theme$}}>
        <Router>
          <Route
            render={(props) => (
              <ContextProvider httpClient={httpClient} core={core} configService={configService}>
                <Main title={'Search Guard'} httpClient={httpClient} {...props} />
              </ContextProvider>
            )}
          />
        </Router>
      </KibanaThemeProvider>
    </I18nProvider>,

    element
  );

  return () => {
    removeExternalHistoryListener();
    ReactDOM.unmountComponentAtNode(element);
  };
};
