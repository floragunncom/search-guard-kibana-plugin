import { fetchAllFromScroll } from './fetch_all_from_scroll';

// TODO: fix the tests
describe('fetch_all_from_scroll', () => {
  let mockResponse;
  let callWithRequestStub;

  beforeEach(() => {
    mockResponse = {};

    callWithRequestStub = jest.fn()
      .mockReturnValueOnce(new Promise(resolve => resolve({
        hits: { hits: ['c'] },
        _scroll_id: 'newId'
      })));
  });

  describe('response has no hits', () => {
    beforeEach(() => {
      mockResponse = { hits: { hits: [] } };
    });

    it('should return an empty array', async () => {
      const hits = await fetchAllFromScroll(mockResponse);
      expect(hits).toEqual([]);
      expect(callWithRequestStub.mock.calls.length).toBe(0);
    });
  });

  describe('response has hits', () => {
    beforeEach(() => {
      mockResponse = {
        hits: {
          hits: ['a', 'b']
        },
        _scroll_id: 'origId'
      };
    });

    it('should return the hits', async () => {
      const hits = await fetchAllFromScroll(mockResponse, callWithRequestStub);
      expect(hits).toEqual(['a', 'b', 'c']);
      expect(callWithRequestStub.mock.calls.length).toBe(2);
      expect(callWithRequestStub.mock.calls[0][1].body.scroll_id).toEqual('origId');
      expect(callWithRequestStub.mock.calls[1][1].body.scroll_id).toEqual('newId');
    });
  });
});
