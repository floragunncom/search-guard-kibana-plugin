import { get } from 'lodash';
import {
  usernameAlreadyExistsText,
  usernameMustNotContainDotsAndAsterisksText,
  passwordsDontMatchText,
  passwordMustBeAtLeast5CharsText
} from './i18n/internal_users';
import {
  nameAlreadyExistsText
} from './i18n/tenants';
import {
  requiredText,
  problemWithValidationTryAgainText
} from './i18n/common';

export const validateInternalUserName = (internalUsersService, isEdit = false) => async (name) => {
  if (!name) throw requiredText;
  const hasDotsAndAsterisks = (/[\.\*]/gm).test(name);
  if (hasDotsAndAsterisks) throw usernameMustNotContainDotsAndAsterisksText;
  try {
    const { data: users } = await internalUsersService.list();
    if (!isEdit && Object.keys(users).includes(name)) return usernameAlreadyExistsText;
  } catch (error) {
    throw problemWithValidationTryAgainText;
  }
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

export const validateTenantName = (tenantsService, isEdit = false) => async (name) => {
  if (!name) throw requiredText;
  try {
    const { data: tenants } = await tenantsService.list();
    if (!isEdit && Object.keys(tenants).includes(name)) return nameAlreadyExistsText;
  } catch (error) {
    throw problemWithValidationTryAgainText;
  }
};
