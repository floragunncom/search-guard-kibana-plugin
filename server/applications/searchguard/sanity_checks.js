/* eslint-disable @kbn/eslint/require-license-header */
import { DEFAULT_CONFIG } from './read_kibana_config';

export const xPackSecurityErrorText =
  'X-Pack Security needs to be disabled for Search Guard to work properly. Please set "xpack.security.enabled" to false in your kibana.yml';

export const doNotFailOnForbiddenText =
  '"Do not fail on forbidden" is not enabled. Please refer to the documentation: https://docs.search-guard.com/latest/kibana-plugin-installation#configuring-elasticsearch-enable-do-not-fail-on-forbidden';

export const failedCheckDoNotFailOnForbiddenText =
  'Failed to verify the "not_fail_on_forbidden_enabled" option.';

export const defaultCookiePasswordWarnText =
  "Default cookie password detected, please set a password in kibana.yml by setting 'searchguard.cookie.password' (min. 32 characters).";

export const cookieSecureFalseWarnText =
  "'searchguard.cookie.secure' is set to false, cookies are transmitted over unsecure HTTP connection. Consider using HTTPS and set this key to 'true'";

export function checkXPackSecurityDisabled({ pluginDependencies, logger }) {
  if (pluginDependencies.security) {
    logger.error(xPackSecurityErrorText);
    throw new Error(xPackSecurityErrorText);
  }
}

export async function checkDoNotFailOnForbidden({ searchGuardBackend, logger }) {
  try {
    const response = await searchGuardBackend.getKibanaInfoWithInternalUser();
    if (response && response.not_fail_on_forbidden_enabled !== true) {
      logger.warn(doNotFailOnForbiddenText);
    }
  } catch (error) {
    logger.error(`${failedCheckDoNotFailOnForbiddenText} ${error.toString()}`);
  }
}

export function checkCookieConfig({ configService, logger }) {
  if (
    configService.get('searchguard.cookie.password') === DEFAULT_CONFIG.searchguard.cookie.password
  ) {
    logger.warn(defaultCookiePasswordWarnText);
  }

  if (configService.get('searchguard.cookie.secure') !== true) {
    logger.warn(cookieSecureFalseWarnText);
  }
}
