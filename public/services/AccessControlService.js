/* eslint-disable @osd/eslint/require-license-header */
export class AccessControlService {
  constructor({ httpClient }) {
    this.httpClient = httpClient;
  }

  logout() {
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
