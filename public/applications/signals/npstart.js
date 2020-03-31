/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n/react';
import { camelCase } from 'lodash';

import Main from '../../apps/signals/pages/Main';
import { APP_NAME } from '../../apps/signals/utils/constants';

import { ContextProvider } from '../../apps/signals/Context';

import 'react-vis/dist/style.css';
import '../../apps/signals/style.scss';

export const renderApp = ({ core, httpClient, element }) => {
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

  return () => ReactDOM.unmountComponentAtNode(element);
};
