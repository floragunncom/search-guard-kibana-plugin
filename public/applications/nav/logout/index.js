/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';

import { LogOutButton } from './LogOutButton';
import { logoutText } from '../utils/i18n';

export class LogOutService {
  async start({ core, httpClient, config }) {
    const {
      userName,
      auth: { type: authType, logoout_url: logoutUrl },
    } = config;

    const props = { httpClient, authType };

    if (logoutUrl) {
      props.logoutUrl = logoutUrl;
    }

    if (userName) {
      props.logoutButtonText = userName;
      props.logoutTooltipText = (
        <>
          {logoutText} {userName}
        </>
      );
    }

    core.chrome.navControls.registerRight({
      order: 5000,
      mount: element => {
        ReactDOM.render(<LogOutButton {...props} />, element);
        return () => ReactDOM.unmountComponentAtNode(element);
      },
    });
  }
}
