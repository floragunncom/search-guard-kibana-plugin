import { requiredText } from '../i18n/common';

export const validateEmptyField = value => !value ? requiredText : undefined;
