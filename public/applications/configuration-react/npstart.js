import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Main from './pages/Main';

import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n/react';

import { HttpWrapper } from "../../utils/httpWrapper";


export const renderApp = (core, deps, params, config) => {
  const httpWrapper = new HttpWrapper();
  ReactDOM.render(

    <I18nProvider>
      <Router>
        <Route
          render={props => (

              <Main
                title={'Search Guard'}
                httpClient={httpWrapper.setCoreHttp(core.http)}
                {...props}
              >
              </Main>

          )}
        />
      </Router>
    </I18nProvider>

    , params.element
);

  return () => ReactDOM.unmountComponentAtNode(params.element);
}