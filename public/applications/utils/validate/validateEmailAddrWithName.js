import { invalidEmailAddressText, requiredText } from '../i18n/common';

// Matches RFC-822 compliant e-mails:
// 1. email@domain               ^(\S+@\S+)$
// 2. Name <email@domain>        ^((\S )+<\S+@\S+>)$
// 3. "Full Name" <email@domain> ^("(\S+| *)+" <\S+@\S+>)$
const adressWithNameRegExp = /^(\S+@\S+)$|^("?(\S+| *)+"? <\S+@\S+>)$|^(\S )+<\S+@\S+>$/;

export const validateEmailAddrWithName = (isEmptyInvalid = true) => emailAddr => {
  if (!emailAddr || !emailAddr.length) {
    return isEmptyInvalid ? requiredText : null;
  }

  if (Array.isArray(emailAddr)) {
    return emailAddr.every(({label}) => adressWithNameRegExp.test(label)) ? null : invalidEmailAddressText;
  }

  return adressWithNameRegExp.test(emailAddr) ? null: invalidEmailAddressText;
};
