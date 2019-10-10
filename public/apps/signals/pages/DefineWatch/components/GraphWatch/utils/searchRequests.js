import { comboBoxOptionsToArray } from '../../../../../utils/helpers';
import { buildGraphQuery, buildUiGraphQuery } from '../../../utils';
import { WATCH_CHECK_TYPE, WATCH_CHECK_SEARCH_NAME_DEFAULT } from '../../../utils/constants';

export function buildSearchRequest({
  _ui: {
    bucketValue,
    bucketUnitOfTime,
    timeField,
    aggregationType,
    fieldName,
    index
  }
}, uiGraphQuery = true) {
  const indices = comboBoxOptionsToArray(index);
  const body = uiGraphQuery
    ? buildUiGraphQuery({
      bucketValue,
      bucketUnitOfTime,
      timeField,
      aggregationType,
      fieldName
    })
    : buildGraphQuery({
      bucketValue,
      bucketUnitOfTime,
      timeField,
      aggregationType,
      fieldName
    });

  return {
    type: WATCH_CHECK_TYPE.SEARCH,
    name: WATCH_CHECK_SEARCH_NAME_DEFAULT,
    target: WATCH_CHECK_SEARCH_NAME_DEFAULT,
    request: { indices, body }
  };
}
