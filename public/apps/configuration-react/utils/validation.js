import { get } from 'lodash';
import {
  i18nRequiredText,
  i18nUsernameMustNotContainDotsAndAsterisks,
  i18nPasswordMustBeAtLeast5Chars,
  i18nPasswordsDontMatchText,
  i18nUsernameAlreadyExists
} from './i18n_nodes';

export const validateInternalUserName = ({ users, isEdit }) => name => {
  if (!name) throw i18nRequiredText;
  const hasDotsAndAsterisks = (/[\.\*]/gm).test(name);
  if (hasDotsAndAsterisks) throw i18nUsernameMustNotContainDotsAndAsterisks;
  if (!isEdit && users.includes(name)) throw i18nUsernameAlreadyExists;
};

export const validatePassword = passwordConfirmation => password => {
  if (!password) throw i18nRequiredText;
  if (password.length < 5) throw i18nPasswordMustBeAtLeast5Chars;
  if (password !== passwordConfirmation) throw i18nPasswordsDontMatchText;
};

export const validateTextField = value => {
  if (!value) throw i18nRequiredText;
};

export const isInvalid = (name, form) => {
  return !!get(form.touched, name, false) && !!get(form.errors, name, false);
};

export const hasError = (name, form) => get(form.errors, name);
