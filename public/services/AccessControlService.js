/* eslint-disable @kbn/eslint/require-license-header */

import { sgContext } from "../utils/sgContext";

// TODO: Refactor to the new platform - deprecate ui/chrome lib
const basePath = sgContext.getBasePath();
const authConfig = sgContext.config.get('auth');
const authType = authConfig.type || null;
const logoutUrl = authConfig.logout_url || null;

export class AccessControlService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  logout() {
    // @todo Make sure the httpClient really adds the basePath automatically
    return this.httpClient.post(`/api/v1/auth/logout`).then(response => {
      localStorage.clear();
      sessionStorage.clear();

      if (authType && ['openid', 'saml'].indexOf(authType) > -1) {
        if (response.data.redirectURL) {
          window.location.href = response.data.redirectURL;
        } else {
          window.location.href = `${basePath}/customerror`;
        }
      } else {
        if (logoutUrl && logoutUrl.length > 0) {
          window.location.href = logoutUrl;
        } else {
          window.location.href = `${basePath}/login?type=${authType || ''}Logout`;
        }
      }
    });
  }
}
