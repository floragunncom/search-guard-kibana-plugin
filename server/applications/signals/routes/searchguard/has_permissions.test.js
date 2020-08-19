/* eslint-disable @kbn/eslint/require-license-header */
import { hasPermissions } from './has_permissions';
import { PERMISSIONS_FOR_ACCESS } from '../../../../../utils/signals/constants';
import {
  httpRouteMock,
  setupLoggerMock,
  setupSearchGuardBackendInstMock,
} from '../../../../utils/mocks';
import { mockResponseOkImplementation, mockErrorResponse, mockSuccessResponse } from '../mocks';

const { setupRequestMock, setupResponseMock } = httpRouteMock;

// TODO: mock http router to test entire route lifecycle.
// Now we test only the route's handler.
describe('routes/searchguard/has_permissions', () => {
  let mockHandlerRequest;
  let mockHandlerResponse;
  let mockSearchGuardBackendService;

  describe('there are some results, responds with 200', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      mockSearchGuardBackendService = setupSearchGuardBackendInstMock();
    });

    it('has permissions if some true', async () => {
      const mockHandlerRequest = setupRequestMock();
      const mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);

      mockSearchGuardBackendService.hasPermissions.mockResolvedValue({
        permissions: {
          'cluster:admin:searchguard:tenant:signals:watch/get': true,
          other_permission: false,
        },
      });

      const result = await hasPermissions({
        searchguardBackendService: mockSearchGuardBackendService,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(mockSearchGuardBackendService.hasPermissions).toHaveBeenCalledWith(
        mockHandlerRequest.headers,
        PERMISSIONS_FOR_ACCESS
      );
      expect(result).toEqual(mockSuccessResponse(true));
    });

    it("doesn't have permissions if all are false", async () => {
      const mockHandlerRequest = setupRequestMock();
      const mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);

      mockSearchGuardBackendService.hasPermissions.mockResolvedValue({
        permissions: {
          'cluster:admin:searchguard:tenant:signals:watch/get': false,
          other_permission: false,
        },
      });

      const result = await hasPermissions({
        searchguardBackendService: mockSearchGuardBackendService,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(mockSearchGuardBackendService.hasPermissions).toHaveBeenCalledWith(
        mockHandlerRequest.headers,
        PERMISSIONS_FOR_ACCESS
      );
      expect(result).toEqual(mockSuccessResponse(false));
    });
  });

  describe('there is an error', () => {
    let logger;

    beforeEach(() => {
      jest.resetAllMocks();
      logger = setupLoggerMock();
      mockHandlerRequest = setupRequestMock();
      mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);
    });

    it('searchGuardBackendService reject', async () => {
      mockSearchGuardBackendService.hasPermissions.mockRejectedValue(new Error('nasty error'));

      const result = await hasPermissions({
        searchguardBackendService: mockSearchGuardBackendService,
        logger,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(result).toEqual(mockErrorResponse('nasty error'));
      expect(logger.error.mock.calls.length).toBe(1);
    });
  });
});
