import { startCase } from 'lodash';
import { arrayToComboBoxOptions } from '../../../../../../utils/helpers';

export default function fieldNamesToUiFieldNames(fieldNames = {}) {
  const result = [];
  Object.entries(fieldNames).map(([dataType, fieldNames]) => {
    result.push({ label: startCase(dataType), options: arrayToComboBoxOptions(Array.from(fieldNames)) });
  });
  return result;
}
