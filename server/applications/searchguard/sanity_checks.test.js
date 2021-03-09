/* eslint-disable @kbn/eslint/require-license-header */
import {
  checkXPackSecurityDisabled,
  xPackSecurityErrorText,
  checkDoNotFailOnForbidden,
  doNotFailOnForbiddenText,
  failedCheckDoNotFailOnForbiddenText,
  checkCookieConfig,
  defaultCookiePasswordWarnText,
  cookieSecureFalseWarnText,
} from './sanity_checks';
import { setupLoggerMock, setupSearchGuardBackendMock } from '../../utils/mocks';

import { ConfigService } from '../../../common';
import { DEFAULT_CONFIG } from '../../index';

describe('sanity_checks', () => {
  describe('checkXPackSecurityDisabled', () => {
    test('log and throw error if X-Pack security plugin enabled', () => {
      const pluginDependencies = { security: true };
      const mockLogger = setupLoggerMock();
      const error = new Error(xPackSecurityErrorText);

      expect(() =>
        checkXPackSecurityDisabled({
          pluginDependencies,
          logger: mockLogger,
        })
      ).toThrow(error);

      expect(mockLogger.error.mock.calls.length).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith(xPackSecurityErrorText);
    });
  });

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
