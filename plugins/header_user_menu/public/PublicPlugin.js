/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import ReactDOM from 'react-dom';
import { HeaderUserMenu } from './HeaderUserMenu';
import { logoutText } from './utils/i18n';

export class PublicPlugin {
  setup() {}

  start(core) {
    const { type: authType, logout_url: logoutUrl } = core.injectedMetadata.getInjectedVar('auth');
    const { user } = core.injectedMetadata.getInjectedVar('sgDynamic');

    let userName = '';
    if (user && !user.isAnonymousAuth) {
      userName = user.username;
    }

    const props = { httpClient: core.http, authType };

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
