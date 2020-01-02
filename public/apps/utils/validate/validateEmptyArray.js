import { requiredText } from '../i18n/common';

export const validateEmptyArray = (array = []) => !array.length ? requiredText : undefined;
