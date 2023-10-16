import { invalidEmailAddressText, requiredText } from '../i18n/common';

export const validateEmailAddr = (isEmptyInvalid = true) => emailAddr => {
  if (!emailAddr || !emailAddr.length) {
    return isEmptyInvalid ? requiredText : null;
  }

  const addressRegExp = /^\S+@\S+$/;

  if (Array.isArray(emailAddr)) {
    return emailAddr.every(({label}) => addressRegExp.test(label)) ? null : invalidEmailAddressText;
  }

  return addressRegExp.test(emailAddr) ? null : invalidEmailAddressText;
};
