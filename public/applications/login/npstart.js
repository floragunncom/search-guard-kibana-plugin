/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { MainContextProvider } from './contexts/MainContextProvider';
import Main from './pages/Main';

import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n/react';
import { HttpWrapper } from '../../utils/httpWrapper';

export const renderApp = (core, deps, params, text) => {
  const httpClient = new HttpWrapper(core.http);

  ReactDOM.render(
    <I18nProvider>
      <Router>
        <Route
          render={() => (
            <MainContextProvider httpClient={httpClient}>
              <Main title={'Testing'} httpClient={httpClient} angularServices={{}} />
            </MainContextProvider>
          )}
        />
      </Router>
    </I18nProvider>,
    params.element
  );

  return () => ReactDOM.unmountComponentAtNode(params.element);
};
