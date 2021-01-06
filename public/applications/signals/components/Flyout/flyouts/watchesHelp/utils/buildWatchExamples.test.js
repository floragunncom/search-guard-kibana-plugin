/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import buildWatchExamples from './buildWatchExamples';
import { WATCH_EXAMPLES } from '../../../../../utils/constants';

describe('buildWatchExamples', () => {
  it('can build examples', () => {
    const watchExamples = buildWatchExamples();

    Object.values(WATCH_EXAMPLES).forEach((watchName) => {
      expect(watchExamples[watchName].json).toEqual(
        expect.objectContaining({
          _id: watchName,
        })
      );

      expect(watchExamples[watchName].doc_link).toEqual(
        expect.stringContaining('/common/examples/watches')
      );
    });

    [
      WATCH_EXAMPLES.AVG_TICKET_PRICE,
      WATCH_EXAMPLES.MAX_MEMORY,
      WATCH_EXAMPLES.MIN_PRODUCT_PRICE,
    ].forEach((watchName) => {
      expect(watchExamples[watchName].graph).toEqual(
        expect.objectContaining({
          _id: `${watchName}_graph`,
        })
      );
    });
  });
});
