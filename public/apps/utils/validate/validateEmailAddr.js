import { invalidEmailAddressText, requiredText } from '../i18n/common';

export const validateEmailAddr = (isEmptyInvalid = true) => emailAddr => {
  if (!emailAddr || !emailAddr.length) {
    return isEmptyInvalid ? requiredText : undefined;
  }

  if (Array.isArray(emailAddr)) {
    for (let i = 0; i < emailAddr.length; i++) {
      if (!/^\S+@\S+$/g.test(emailAddr[i].label)) {
        return invalidEmailAddressText;
      }
    }

    return undefined;
  }

  return !/^\S+@\S+$/g.test(emailAddr) ? invalidEmailAddressText : undefined;
};
