/* eslint-disable @osd/eslint/require-license-header */
import { getFieldsFromPayload, getFieldsForType } from '../../../utils/helpers';
import { arrayToComboBoxOptions } from '../../../../../utils/helpers';

export function getPayloadFieldsForWatchExpressions({ runtime_attributes: payload = {} } = {}) {
  const numberOptions = arrayToComboBoxOptions(
    getFieldsForType(getFieldsFromPayload(payload), 'number')
  );

  return [
    {
      label: 'number',
      options: numberOptions,
    },
  ];
}
