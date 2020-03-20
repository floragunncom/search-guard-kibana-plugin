/* eslint-disable @kbn/eslint/require-license-header */
export class AccessControlService {
  constructor({ httpClient, authType = null }) {
    this.httpClient = httpClient;
    this.authType = authType;
  }

  logout({ logoutUrl = null } = {}) {
    const basePath = this.httpClient.getBasePath();

    return this.httpClient.post('/api/v1/auth/logout').then(response => {
      localStorage.clear();
      sessionStorage.clear();

      if (this.authType && ['openid', 'saml'].indexOf(this.authType) > -1) {
        if (response.data.redirectURL) {
          window.location.href = response.data.redirectURL;
        } else {
          window.location.href = `${basePath}/customerror`;
        }
      } else {
        if (logoutUrl && logoutUrl.length > 0) {
          window.location.href = logoutUrl;
        } else {
          window.location.href = `${basePath}/login?type=${this.authType || ''}Logout`;
        }
      }
    });
  }
}
