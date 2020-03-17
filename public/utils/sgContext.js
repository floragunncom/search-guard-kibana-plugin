export const sgConfig = {
  injectedValues: {},
  /**
   * @todo These are values that we're not sure
   * how to access at the moment. So I'm
   * hard coding them here now until
   * we've had time to look at that
   */
  legacyValues: {
    'kibana.index': '.kibana',
    'elasticsearch.username': 'kibanaserver',

  },
  get(configKey, defaultValue = undefined) {
    if (! configKey) {
      return {
        ...this.injectedValues,
        ...this.legacyValues
      }
    }

    // Remove the searchguard prefix if available
    if (configKey.indexOf('searchguard.') === 0) {
      configKey = configKey.replace('searchguard.', '');
    }

    const result = configKey
      .split('.')
      .reduce((o, key) => {
        if (o && typeof o[key] !== undefined) {
          return o[key];
        }

        return;

      }, this.injectedValues);

    if (typeof result !== 'undefined') {
      return result;
    }

    if (typeof this.legacyValues[configKey] !== 'undefined') {
      return this.legacyValues[configKey];
    }

    console.warn('Somebody wanted missing configKey: ', {configKey})

    return defaultValue;
  }
};


export const sgContext = {
  /**
   * @todo This is used in a couple of places.
   * Figure out how to read the version from package.json
   * Probably the same as now, but how to we set a config value
   * ourselves?
   */
  pluginVersion: 'NP',

  /**
   * Kibana's Core setup
   * @type CoreSetup
   */
  kibanaCore: null,

  /**
   * Values from Kibana.yml
   * @type sgConfig
   */
  config: sgConfig,

  /**
   * @todo At the moment we use the UISettingsClient in a bunch of places for
   * dark mode. Need to update that to NP.
   * @returns {boolean}
   */
  get isDarkMode() {
    return false;
  },

  /**
   * Retrieve the base path from the injected coreSetup.http sertvice
   * @returns {string}
   */
  getBasePath() {
    if (! this.kibanaCore) {
      throw new Error('You need to setup the context first');
    }

    return this.kibanaCore.http.basePath.get();
  }

}