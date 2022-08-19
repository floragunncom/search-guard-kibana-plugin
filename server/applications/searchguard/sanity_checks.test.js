/* eslint-disable @kbn/eslint/require-license-header */
import {
  checkDoNotFailOnForbidden,
  doNotFailOnForbiddenText,
  failedCheckDoNotFailOnForbiddenText,
  allowClientCertificatesNeededForSSLCertificateErrorText,
  checkTLSConfig,
  alwaysPresentCertificateWarnText,
  checkCookieConfig,
  defaultCookiePasswordWarnText,
  cookieSecureFalseWarnText,
} from './sanity_checks';
import { setupLoggerMock, setupSearchGuardBackendMock } from '../../utils/mocks';

import { ConfigService } from '../../../common';
import { DEFAULT_CONFIG } from '../../default_config';

describe('sanity_checks', () => {
  describe('checkDoNotFailOnForbidden', () => {
    let mockLogger;
    let mockSearchGuardBackend;

    beforeEach(() => {
      mockLogger = setupLoggerMock();
      mockSearchGuardBackend = setupSearchGuardBackendMock();
    });

    test('log warning if not not_fail_on_forbidden_enabled', async () => {
      mockSearchGuardBackend.getKibanaInfoWithInternalUser = jest.fn().mockResolvedValue({
        not_fail_on_forbidden_enabled: false,
      });

      await checkDoNotFailOnForbidden({
        searchGuardBackend: mockSearchGuardBackend,
        logger: mockLogger,
      });

      expect(mockLogger.warn.mock.calls.length).toBe(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(doNotFailOnForbiddenText);
    });

    test('do not log warning if not_fail_on_forbidden_enabled', async () => {
      mockSearchGuardBackend.getKibanaInfoWithInternalUser = jest.fn().mockResolvedValue({
        not_fail_on_forbidden_enabled: true,
      });

      await checkDoNotFailOnForbidden({
        searchGuardBackend: mockSearchGuardBackend,
        logger: mockLogger,
      });

      expect(mockLogger.warn.mock.calls.length).toBe(0);
    });

    test('handle rejection', async () => {
      const error = new Error('nasty');
      mockSearchGuardBackend.getKibanaInfoWithInternalUser = jest.fn().mockRejectedValue(error);

      await checkDoNotFailOnForbidden({
        searchGuardBackend: mockSearchGuardBackend,
        logger: mockLogger,
      });

      expect(mockLogger.error.mock.calls.length).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        `${failedCheckDoNotFailOnForbiddenText} ${error.toString()}`
      );
    });
  });

  describe('checkTLSConfig', () => {
    let mockLogger;
    const allowClientCertificateNeededError = new Error(
      allowClientCertificatesNeededForSSLCertificateErrorText
    );

    beforeEach(() => {
      mockLogger = setupLoggerMock();
    });

    test('log and throw error if elasticsearch.ssl.certificate is used, but not explicitly allowed', () => {
      const configService = new ConfigService({
        elasticsearch: {
          ssl: {
            certificate: '/path/to/certificate',
          },
        },
      });

      expect(() => checkTLSConfig({ configService, logger: mockLogger })).toThrow(
        allowClientCertificateNeededError
      );

      expect(mockLogger.error.mock.calls.length).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        allowClientCertificatesNeededForSSLCertificateErrorText
      );
    });

    test('do not log error if elasticsearch.ssl.certificate is used and explicitly allowed', () => {
      const configService = new ConfigService({
        elasticsearch: {
          ssl: {
            certificate: '/path/to/certificate',
          },
        },
        searchguard: {
          allow_client_certificates: true,
        },
      });

      expect(() => checkTLSConfig({ configService, logger: mockLogger })).not.toThrow(
        allowClientCertificateNeededError
      );
      expect(mockLogger.error.mock.calls.length).toBe(0);
    });

    test('log error if elasticsearch.ssl.certificate is used and alwaysPresentCertificate is true', () => {
      const configService = new ConfigService({
        elasticsearch: {
          ssl: {
            certificate: '/path/to/certificate',
            alwaysPresentCertificate: true,
          },
        },
        searchguard: {
          allow_client_certificates: true,
        },
      });

      checkTLSConfig({ configService, logger: mockLogger });

      expect(mockLogger.warn.mock.calls.length).toBe(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(alwaysPresentCertificateWarnText);
    });
  });

  describe('checkCookieConfig', () => {
    let mockLogger;

    beforeEach(() => {
      mockLogger = setupLoggerMock();
    });

    test('log a warning if the cookie password is the default password', () => {
      const configService = new ConfigService({
        searchguard: {
          cookie: {
            password: DEFAULT_CONFIG.searchguard.cookie.password,
          },
        },
      });

      checkCookieConfig({ configService, logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(defaultCookiePasswordWarnText);
    });

    test('log a warning if cookie.secure is not true', () => {
      const configService = new ConfigService({});

      checkCookieConfig({ configService, logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(cookieSecureFalseWarnText);
    });
  });
});
