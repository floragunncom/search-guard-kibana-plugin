/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { get } from 'lodash';
import { HeaderUserMenu } from './HeaderUserMenu';
import { logoutText } from '../utils/i18n';

export class HeaderUserMenuApp {
  start({ core, httpClient, configService } = {}) {
    const userName = configService.get('restapiinfo.user_name');
    const authType = configService.get('searchguard.auth.type');
    const logoutUrl = configService.get('searchguard.auth.logout_url');
    const uiHelpers = configService.get('uiHelpers');
    const props = { httpClient, authType, uiHelpers };

    if (logoutUrl) {
      props.logoutUrl = logoutUrl;
    }

    if (userName) {
      props.userName = userName.slice(0, 20);
      props.userNameTooltipText = (
        <>
          {logoutText} {userName}
        </>
      );
    }

    core.chrome.navControls.registerRight({
      order: 5000,
      mount: (element) => {
        ReactDOM.render(<HeaderUserMenu {...props} />, element);
        return () => ReactDOM.unmountComponentAtNode(element);
      },
    });
  }
}
