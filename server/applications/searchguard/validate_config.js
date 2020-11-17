/* eslint-disable @kbn/eslint/require-license-header */

export function validateKibanaConfig(kibanaConfig) {
  kibanaConfig = validateAuthBackwardsCompatibility(kibanaConfig);
  return kibanaConfig;
}

/**
 * Enables the old format for setting up the auth type
 * @param kibanaConfig
 * @returns {*}
 */
function validateAuthBackwardsCompatibility(kibanaConfig) {
  if (kibanaConfig.searchguard.basicauth.enabled) {
    kibanaConfig.searchguard.auth.type = 'basicauth';
  } else if (kibanaConfig.searchguard.jwt.enabled) {
    kibanaConfig.searchguard.auth.type = 'jwt';
  }

  return kibanaConfig;
}
