import { comboBoxOptionsToArray } from '../../../../../utils/helpers';
import { buildGraphQuery, buildUiGraphQuery } from '../../../utils';
import { CHECK_TYPES, CHECK_MYSEARCH } from '../../../utils/constants';

export function buildSearchRequest({ _ui: ui }, isUiGraphQuery = true) {
  const indices = comboBoxOptionsToArray(ui.index);

  return {
    type: CHECK_TYPES.SEARCH,
    name: CHECK_MYSEARCH,
    target: CHECK_MYSEARCH,
    request: {
      indices,
      body: isUiGraphQuery ? buildUiGraphQuery(ui) : buildGraphQuery(ui),
    },
  };
}
