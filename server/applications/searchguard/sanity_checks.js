/* eslint-disable @kbn/eslint/require-license-header */
import { DEFAULT_CONFIG } from '../../default_config';

export const xPackSecurityErrorText =
  'X-Pack Security needs to be disabled for Search Guard to work properly. Please set "xpack.security.enabled" to false in your kibana.yml';

export const doNotFailOnForbiddenText =
  '"Do not fail on forbidden" is not enabled. Please refer to the documentation: https://docs.search-guard.com/latest/kibana-plugin-installation#configuring-elasticsearch-enable-do-not-fail-on-forbidden';

export const failedCheckDoNotFailOnForbiddenText =
  'Failed to verify the "not_fail_on_forbidden_enabled" option.';

export const allowClientCertificatesNeededForSSLCertificateErrorText =
  '"elasticsearch.ssl.certificate" can not be used without setting "searchguard.allow_client_certificates" to "true" in kibana.yml. Please refer to the documentation for more information about the implications of doing so: https://docs.search-guard.com/latest/kibana-plugin-installation#client-certificates-elasticsearchsslcertificate';

export const alwaysPresentCertificateWarnText =
  "'elasticsearch.ssl.alwaysPresentCertificate' may lead to requests being executed as the user attached to the certificate configured in 'elasticsearch.ssl.certificate'.";

export const defaultCookiePasswordWarnText =
  "Default cookie password detected, please set a password in kibana.yml by setting 'searchguard.cookie.password' (min. 32 characters).";

export const cookieSecureFalseWarnText =
  "'searchguard.cookie.secure' is set to false, cookies are transmitted over unsecure HTTP connection. Consider using HTTPS and set this key to 'true'";

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

export function checkTLSConfig({ configService, logger }) {
  const sslConfig = configService.get('elasticsearch.ssl', {});

  if (typeof sslConfig.certificate !== 'undefined' && sslConfig.certificate !== false) {
    if (configService.get('searchguard.allow_client_certificates') !== true) {
      logger.error(allowClientCertificatesNeededForSSLCertificateErrorText);
      throw new Error(allowClientCertificatesNeededForSSLCertificateErrorText);
    }

    if (sslConfig.alwaysPresentCertificate === true) {
      // Client certificates allowed, but we still want to warn if alwaysPresentCertificate is true.
      logger.warn(alwaysPresentCertificateWarnText);
    }
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
