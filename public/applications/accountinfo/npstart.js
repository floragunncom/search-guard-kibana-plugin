import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MainContextProvider } from './contexts/MainContextProvider';
import Main from './pages/Main';

import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n/react';

export const renderApp = (core, deps, params, text) => {
  ReactDOM.render(

    <I18nProvider>
      <Router>
        <Route
          render={props => (
            <MainContextProvider httpClient={core.http}>
              <Main
                title={'Testing'}
                httpClient={core.http}
                angularServices={{}}
              >
              </Main>
            </MainContextProvider>
          )}
        />
      </Router>
    </I18nProvider>

    , params.element);

  return () => ReactDOM.unmountComponentAtNode(params.element);
}