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
