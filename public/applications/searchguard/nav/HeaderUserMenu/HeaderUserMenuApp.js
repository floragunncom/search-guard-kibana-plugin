/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { HeaderUserMenu } from './HeaderUserMenu';

export class HeaderUserMenuApp {
  start({ core, httpClient, configService } = {}) {
    core.chrome.navControls.registerRight({
      order: 5000,
      mount: (element) => {
        ReactDOM.render(
          <HeaderUserMenu httpClient={httpClient} configService={configService} />,
          element
        );
        return () => ReactDOM.unmountComponentAtNode(element);
      },
    });
  }
}
