/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';

import { CustomErrorPage } from './CustomErrorPage';

import { stringCSSToReactStyle } from '../../../utils/cssHelper';

export function renderApp({ element, basePath, config }) {
  ReactDOM.render(
    <CustomErrorPage
      basePath={basePath}
      brandImagePath={config.searchguard.login.brandimage}
      showBrandImage={config.searchguard.login.showbrandimage}
      backButtonStyle={stringCSSToReactStyle(config.searchguard.login.buttonstyle)}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
}
