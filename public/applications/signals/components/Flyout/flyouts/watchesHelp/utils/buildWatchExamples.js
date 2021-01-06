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

import { DOC_LINKS, WATCH_EXAMPLES } from '../../../../../utils/constants';
import watchExamples from '../../../../../../../../common/examples/watches';

export default function buildWatchExamples() {
  return Object.values(WATCH_EXAMPLES).reduce((acc, watchName) => {
    acc[watchName] = {
      json: watchExamples[watchName],
      graph: watchExamples[`${watchName}_graph`],
      doc_link: `${DOC_LINKS.REPO}/tree/master/common/examples/watches/${watchName}`,
    };
    return acc;
  }, {});
}
