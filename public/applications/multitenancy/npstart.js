import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MainContextProvider } from './contexts/MainContextProvider';
import Main from './pages/Main';

import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n/react';

import { HttpWrapper } from "../../utils/httpWrapper";


export const renderApp = (core, deps, params, config) => {
  const httpWrapper = new HttpWrapper(core.http);
  ReactDOM.render(

    <I18nProvider>
      <Router>
        <Route
          render={props => (
            <MainContextProvider
              httpClient={httpWrapper.setCoreHttp(core.http)}
              core={core}
              config={config}
            >
              <Main
                title={'Testing'}
                httpClient={httpWrapper}
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