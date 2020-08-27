/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';

import { CustomErrorPage } from './CustomErrorPage';

import { stringCSSToReactStyle } from '../../../utils/cssHelper';

export function renderApp({ element, basePath, config }) {
  ReactDOM.render(
    <CustomErrorPage
      basePath={basePath}
      brandImagePath={config.searchguard.basicauth.login.brandimage}
      showBrandImage={config.searchguard.basicauth.login.showbrandimage}
      backButtonStyle={stringCSSToReactStyle(config.searchguard.basicauth.login.buttonstyle)}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
}
