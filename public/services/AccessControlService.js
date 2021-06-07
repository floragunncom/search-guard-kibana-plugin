/* eslint-disable @kbn/eslint/require-license-header */
export class AccessControlService {
  constructor({ httpClient, authType = null }) {
    this.httpClient = httpClient;
    // @todo AuthType should be obsolete
    this.authType = authType;
  }

  logout({ logoutUrl = null } = {}) {
    const basePath = this.httpClient.getBasePath();

    return this.httpClient.post('/api/v1/auth/logout').then(response => {
      localStorage.clear();
      sessionStorage.clear();

      // @todo Try to make all of the following code obsolete, in favor
      // of passing a redirectURL when logging out from the backend
      if (response.data.redirectURL) {
        window.location.href = response.data.redirectURL;
        return;
      }

      window.location.href = `${basePath}/login`;
    });
  }
}
