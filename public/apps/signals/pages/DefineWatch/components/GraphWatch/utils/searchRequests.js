import { comboBoxOptionsToArray } from '../../../../../utils/helpers';
import { buildGraphQuery, buildUiGraphQuery } from '../../../utils';
import { WATCH_CHECK_TYPE, WATCH_CHECK_SEARCH_NAME_DEFAULT } from '../../../utils/constants';

export function buildSearchRequest({
  _bucketValue,
  _bucketUnitOfTime,
  _timeField,
  _aggregationType,
  _fieldName,
  _index
}, uiGraphQuery = true) {
  const indices = comboBoxOptionsToArray(_index);
  const body = uiGraphQuery
    ? buildUiGraphQuery({
      _bucketValue,
      _bucketUnitOfTime,
      _timeField,
      _aggregationType,
      _fieldName
    })
    : buildGraphQuery({
      _bucketValue,
      _bucketUnitOfTime,
      _timeField,
      _aggregationType,
      _fieldName
    });

  return {
    type: WATCH_CHECK_TYPE.SEARCH,
    name: WATCH_CHECK_SEARCH_NAME_DEFAULT,
    target: WATCH_CHECK_SEARCH_NAME_DEFAULT,
    request: { indices, body }
  };
}
