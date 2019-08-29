import { requiredText, invalidJsonText } from '../i18n/common';

export const validateJsonString = value => {
  if (!value) return requiredText;

  try {
    JSON.parse(value);
  } catch (error) {
    return invalidJsonText;
  }

  return null;
}
