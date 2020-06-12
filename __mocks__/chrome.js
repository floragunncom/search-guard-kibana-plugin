/* eslint-disable @kbn/eslint/require-license-header */
class Chrome {
  getBasePath () {
    return null;
  }

  getInjected() {
    return {
      type: null,
      logout_url: null,
    };
  }

  getUiSettingsClient() {
    return {
      get: () => null,
    };
  }
}

export default new Chrome();

