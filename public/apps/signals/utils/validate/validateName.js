import { isNameHasProhibitedSpecialChars } from '../helpers';
import {
  requiredText,
  problemWithValidationTryAgainText,
  nameAlreadyExistsText,
  validCharsForNameAreText
} from '../i18n/common';

export const validateName = (Service, isUpdatingName = false) => async (name) => {
  if (!name) return requiredText;
  if (isNameHasProhibitedSpecialChars(name)) return validCharsForNameAreText;

  try {
    const { resp: { _id } } = await Service.get(name);
    const newNameAlreadyExists = isUpdatingName && (_id === name);
    if (newNameAlreadyExists) return nameAlreadyExistsText;
  } catch (error) {
    if (error.statusCode === 404) return undefined;
    throw problemWithValidationTryAgainText;
  }

  return undefined;
};
