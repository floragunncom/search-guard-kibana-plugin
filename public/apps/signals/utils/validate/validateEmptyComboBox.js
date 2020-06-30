/* eslint-disable @kbn/eslint/require-license-header */
import { isEmpty } from 'lodash';
import { requiredText } from '../i18n/common';

export const validateEmptyComboBox = (value) => {
  if (isEmpty(value)) return requiredText;
};
