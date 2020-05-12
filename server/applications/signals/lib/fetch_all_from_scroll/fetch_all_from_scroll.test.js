/* eslint-disable @kbn/eslint/require-license-header */
import { fetchAllFromScroll } from './fetch_all_from_scroll';
import { elasticsearchMock, httpRouteMock } from '../../../../utils/mocks';

const { setupClusterClientMock, setupClusterClientScopedMock } = elasticsearchMock;
const { setupRequestMock } = httpRouteMock;

describe('fetch_all_from_scroll', () => {
  it('should return empty array if no hits in the response argument', async () => {
    const mockResponse = {};

    const mockClusterClientScoped = setupClusterClientScopedMock();
    mockClusterClientScoped.callAsCurrentUser.mockReturnValue(mockResponse);

    const mockClusterClient = setupClusterClientMock();
    mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

    const hits = await fetchAllFromScroll({
      clusterClient: mockClusterClient,
      response: mockResponse,
      scroll: '1m',
      request: setupRequestMock(),
    });

    expect(hits).toEqual([]);
    expect(mockClusterClient.asScoped.mock.calls.length).toBe(0);
  });

  it('should throw clusterClient error if any', async () => {
    const mockResponse = {
      hits: {
        hits: ['a', 'b'],
      },
      _scroll_id: 'firstId',
    };

    const mockClusterClientScoped = setupClusterClientScopedMock();
    mockClusterClientScoped.callAsCurrentUser.mockRejectedValue(new Error('error'));

    const mockClusterClient = setupClusterClientMock();
    mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

    expect(
      fetchAllFromScroll({
        clusterClient: mockClusterClient,
        response: mockResponse,
        scroll: '1m',
        request: setupRequestMock(),
      })
    ).rejects.toEqual(new Error('error'));
  });

  it('should return the hits if there are any and scroll until there are no hits', async () => {
    const mockClusterClientScoped = setupClusterClientScopedMock();

    mockClusterClientScoped.callAsCurrentUser.mockReturnValueOnce({
      hits: {
        hits: ['c'],
      },
      _scroll_id: 'secondId',
    });

    mockClusterClientScoped.callAsCurrentUser.mockReturnValue({
      hits: {
        hits: [],
      },
      _scroll_id: 'thirdId',
    });

    const mockClusterClient = setupClusterClientMock();
    mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

    const mockResponse = {
      hits: {
        hits: ['a', 'b'],
      },
      _scroll_id: 'firstId',
    };

    const hits = await fetchAllFromScroll({
      clusterClient: mockClusterClient,
      response: mockResponse,
      scroll: '1m',
      request: setupRequestMock(),
    });

    expect(hits).toEqual(['a', 'b', 'c']);
    expect(mockClusterClient.asScoped.mock.calls.length).toBe(2);
  });
});
