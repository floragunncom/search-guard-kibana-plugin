/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { KibanaThemeProvider } from '@kbn/react-kibana-context-theme';
import { CustomErrorPage } from './CustomErrorPage';

import { stringCSSToReactStyle } from '../../../utils/cssHelper';

export function renderApp({ element, basePath, config, httpClient, theme$ }) {
  ReactDOM.render(
    <KibanaThemeProvider theme={{theme$}}>
      <CustomErrorPage
        basePath={basePath}
        httpClient={httpClient}
      />
    </KibanaThemeProvider>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
}
