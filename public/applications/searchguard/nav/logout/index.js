/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { get } from 'lodash';
import { HeaderUserMenu } from './header_user_menu';
import { logoutText } from '../utils/i18n';

export class HeaderUserMenuService {
  start({ core, httpClient, config = {} } = {}) {
    const { user_name: userName } = config.rest_info;
    const { type: authType, logout_url: logoutUrl } = get(config, 'searchguard.auth');

    const props = { httpClient, authType };

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
      mount: element => {
        ReactDOM.render(<HeaderUserMenu {...props} />, element);
        return () => ReactDOM.unmountComponentAtNode(element);
      },
    });
  }
}
