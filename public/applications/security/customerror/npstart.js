/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';

import { CustomErrorPage } from './CustomErrorPage';

import { stringCSSToReactStyle } from '../../../utils/cssHelper';

export function renderApp({ element, basePath, config }) {
  ReactDOM.render(
    <CustomErrorPage
      basePath={basePath}
      brandImagePath={config.eliatra.security.login.brandimage}
      showBrandImage={config.eliatra.security.login.showbrandimage}
      backButtonStyle={stringCSSToReactStyle(config.eliatra.security.login.buttonstyle)}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
}
