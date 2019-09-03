import { invalidEmailAddressText, requiredText } from '../i18n/common';

export const validateEmailAddr = (isEmptyInvalid = true) => emailAddr => {
  if (!emailAddr || !emailAddr.length) {
    return isEmptyInvalid ? requiredText : null;
  }

  if (Array.isArray(emailAddr)) {
    for (let i = 0; i < emailAddr.length; i++) {
      if (!/^\S+@\S+$/g.test(emailAddr[i].label)) {
        return invalidEmailAddressText;
      }
    }

    return null;
  }

  return !/^\S+@\S+$/g.test(emailAddr) ? invalidEmailAddressText : null;
};
