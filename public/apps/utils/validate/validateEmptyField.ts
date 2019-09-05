import { requiredText } from '../i18n/common';

export const validateEmptyField = (value: string) => !value ? requiredText : null;
