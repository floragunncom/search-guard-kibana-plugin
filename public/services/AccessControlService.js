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

      if (response.data.redirectURL) {
        window.location.href = response.data.redirectURL;
        return;
      }

      //@todo Try to make all of the following code obsolete, in favor
      //of passing a redirectURL when logging out from the backend
      if (this.authType && ['openid', 'saml'].indexOf(this.authType) > -1) {
        if (response.data.redirectURL) {
          window.location.href = response.data.redirectURL;
        } else {
          // @todo This is not really an error, just a confirmation page for the logout.
          // @todo Handle this - do we ever need it for openid?
          window.location.href = `${basePath}/customerror`;
        }
      } else {
        // @todo logoutUrl originally comes from the searchguard.auth.logout_url property.
        // @todo Move this to the backend and always use response.data.redirectURL instead.
        if (logoutUrl && logoutUrl.length > 0) {
          window.location.href = logoutUrl;
        } else {
          window.location.href = `${basePath}/login?type=${this.authType || ''}Logout`;
        }
      }
    });
  }
}
