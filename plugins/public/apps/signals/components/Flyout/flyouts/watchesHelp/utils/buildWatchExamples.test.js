import buildWatchExamples from './buildWatchExamples';
import { WATCH_EXAMPLES } from '../../../../../utils/constants';

describe('buildWatchExamples', () => {
  it('can build examples', () => {
    const watchExamples = buildWatchExamples();

    Object.values(WATCH_EXAMPLES).forEach(watchName => {
      expect(
        watchExamples[watchName].json
      ).toEqual(expect.objectContaining({
        _id: watchName
      }));

      expect(
        watchExamples[watchName].doc_link
      ).toEqual(expect.stringContaining('/examples/watches'));
    });

    [
      WATCH_EXAMPLES.AVG_TICKET_PRICE,
      WATCH_EXAMPLES.MAX_MEMORY,
      WATCH_EXAMPLES.MIN_PRODUCT_PRICE
    ].forEach(watchName => {
      expect(
        watchExamples[watchName].graph
      ).toEqual(expect.objectContaining({
        _id: `${watchName}_graph`
      }));
    });
  });
});
