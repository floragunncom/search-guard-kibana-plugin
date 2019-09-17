import { requiredText } from '../i18n/common';

export const validateEmptyField = (value: string): JSX.Element | null =>
  !value ? requiredText : null;
