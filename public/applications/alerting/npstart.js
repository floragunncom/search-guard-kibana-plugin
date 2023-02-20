/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@osd/i18n/react';
import { camelCase } from 'lodash';

import Main from './pages/Main';
import { APP_NAME } from './utils/constants';

import { ContextProvider } from './Context';

import 'react-vis/dist/style.css';
import './style.scss';

export const renderApp = ({ core, httpClient, element, removeExternalHistoryListener }) => {
  ReactDOM.render(
    <I18nProvider>
      <Router>
        <Route
          render={props => (
            <ContextProvider httpClient={httpClient} core={core}>
              <Main title={camelCase(APP_NAME)} httpClient={httpClient} {...props} />
            </ContextProvider>
          )}
        />
      </Router>
    </I18nProvider>,
    element
  );

  return () => {
    removeExternalHistoryListener();
    ReactDOM.unmountComponentAtNode(element);
  };
};
