import { get } from 'lodash';
import {
  usernameAlreadyExistsText,
  usernameMustNotContainDotsAndAsterisksText,
  passwordsDontMatchText,
  passwordMustBeAtLeast5CharsText
} from './i18n/internal_users';
import {
  requiredText,
  problemWithValidationTryAgainText,
  nameAlreadyExistsText,
  nameMustNotContainDotsText,
  jsonIsInvalidText
} from './i18n/common';

// TODO: deprecate it in favour of validateName
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

// TODO: deprecate it in favour of validateName
export const validateTenantName = (tenantsService, isEdit = false) => async (name) => {
  if (!name) throw requiredText;
  try {
    const { data: tenants } = await tenantsService.list();
    if (!isEdit && Object.keys(tenants).includes(name)) return nameAlreadyExistsText;
  } catch (error) {
    throw problemWithValidationTryAgainText;
  }
};

// TODO: deprecate it in favour of validateName
export const validateActionGroupName = (actionGroupsService, isEdit = false) => async (name) => {
  if (!name) throw requiredText;
  const hasDots = (/[\.]/gm).test(name);
  if (hasDots) throw nameMustNotContainDotsText;
  try {
    const { data: actionGroups } = await actionGroupsService.list();
    if (!isEdit && Object.keys(actionGroups).includes(name)) return nameAlreadyExistsText;
  } catch (error) {
    throw problemWithValidationTryAgainText;
  }
};

export const validateName = (Service, isEdit = false) => async (name) => {
  if (!name) throw requiredText;
  const hasDots = (/[\.]/gm).test(name);
  if (hasDots) throw nameMustNotContainDotsText;
  try {
    const { data: actionGroups } = await Service.list();
    if (!isEdit && Object.keys(actionGroups).includes(name)) return nameAlreadyExistsText;
  } catch (error) {
    throw problemWithValidationTryAgainText;
  }
};

export const validateESDSL = dslQuery => {
  try {
    JSON.parse(dslQuery);
  } catch (error) {
    throw jsonIsInvalidText;
  }
};
