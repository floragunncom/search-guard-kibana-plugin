/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';

import { CustomErrorPage } from './CustomErrorPage';

export function renderApp({ element, basePath, config }) {
  ReactDOM.render(
    <CustomErrorPage
      basePath={basePath}
      brandImagePath={config.basicauth.login.brandimage}
      showBrandImage={config.basicauth.login.showbrandimage}
      backButtonProps={config.basicauth.login.buttonstyle}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
}
