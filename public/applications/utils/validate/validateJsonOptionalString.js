/* eslint-disable @kbn/eslint/require-license-header */
import { invalidJsonText } from '../i18n/common';

export const validateJsonOptionalString = (value) => {
  if (!value) return null;

  try {
    JSON.parse(value);
  } catch (error) {
    return invalidJsonText;
  }

  return null;
};
