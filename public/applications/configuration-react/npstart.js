/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import Main from './pages/Main';

import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n/react';

import { ContextProvider } from './Context';

import './style.scss';

export const renderApp = ({ httpClient, element, core }) => {
  ReactDOM.render(
    <I18nProvider>
      <Router>
        <Route
          render={props => (
            <ContextProvider httpClient={httpClient} core={core}>
              <Main title={'Search Guard'} httpClient={httpClient} {...props} />
            </ContextProvider>
          )}
        />
      </Router>
    </I18nProvider>,

    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
