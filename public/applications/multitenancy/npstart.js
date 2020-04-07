/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { MainContextProvider } from './contexts/MainContextProvider';
import { MultiTenancyPage } from './MultiTenancyPage';

import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n/react';

export const renderApp = ({ element, sgContext, httpClient }) => {
  ReactDOM.render(
    <I18nProvider>
      <Router>
        <Route
          render={props => (
            <MainContextProvider>
              <MultiTenancyPage httpClient={httpClient} sgContext={sgContext} {...props} />
            </MainContextProvider>
          )}
        />
      </Router>
    </I18nProvider>,

    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
