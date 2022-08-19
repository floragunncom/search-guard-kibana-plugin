/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { I18nProvider } from '@kbn/i18n-react';
import { ContextProvider } from './Context';
import { Main } from './pages';

export const renderApp = ({ httpClient, element, core, configService }) => {
  ReactDOM.render(
    <I18nProvider>
      <Router>
        <Route
          render={(props) => (
            <ContextProvider httpClient={httpClient} core={core} configService={configService}>
              <Main title={'Auth Tokens'} httpClient={httpClient} {...props} />
            </ContextProvider>
          )}
        />
      </Router>
    </I18nProvider>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
