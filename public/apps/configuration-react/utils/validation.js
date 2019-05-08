import { get } from 'lodash';
import {
  usernameAlreadyExistsText,
  usernameMustNotContainDotsAndAsterisksText,
  passwordsDontMatchText,
  passwordMustBeAtLeast5CharsText
} from './i18n/internalusers';
import { requiredText } from './i18n/common';

export const validateInternalUserName = ({ allUsers, isEdit }) => name => {
  if (!name) throw requiredText;
  const hasDotsAndAsterisks = (/[\.\*]/gm).test(name);
  if (hasDotsAndAsterisks) throw usernameMustNotContainDotsAndAsterisksText;
  if (!isEdit && allUsers.includes(name)) throw usernameAlreadyExistsText;
};

export const validatePassword = passwordConfirmation => password => {
  if (!password) throw requiredText;
  if (password.length < 5) throw passwordMustBeAtLeast5CharsText;
  if (password !== passwordConfirmation) throw passwordsDontMatchText;
};

export const validateTextField = value => {
  if (!value) throw requiredText;
};

export const isInvalid = (name, form) => {
  return !!get(form.touched, name, false) && !!get(form.errors, name, false);
};

export const hasError = (name, form) => get(form.errors, name);
