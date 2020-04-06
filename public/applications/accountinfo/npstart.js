import React from 'react';
import ReactDOM from 'react-dom';
import { MainContextProvider } from './contexts/MainContextProvider';
import Main from './pages/Main';

import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n/react';

import { HttpWrapper } from '../../utils/httpWrapper';

export const renderApp = (core, params) => {
  const httpWrapper = new HttpWrapper();
  ReactDOM.render(
    <I18nProvider>
      <Router>
        <Route
          render={props => (
            <MainContextProvider httpClient={httpWrapper.setCoreHttp(core.http)}>
              <Main httpClient={httpWrapper} {...props} />
            </MainContextProvider>
          )}
        />
      </Router>
    </I18nProvider>,

    params.element
  );

  return () => ReactDOM.unmountComponentAtNode(params.element);
};
