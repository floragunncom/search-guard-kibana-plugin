import { get, isEmpty } from 'lodash';
import {
  nameMustNotContainDotsAndAsterisksText,
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
import { dlsQuerySyntaxIsInvalidText } from './i18n/roles';
import { API } from './constants';

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

export const validateName = (Service, isUpdatingName = false) => async (name) => {
  if (!name) throw requiredText;
  const hasDots = (/[\.]/gm).test(name);
  if (hasDots) throw nameMustNotContainDotsText;
  try {
    const { data } = await Service.list();
    const newNameAlreadyExists = isUpdatingName && Object.keys(data).includes(name);
    if (newNameAlreadyExists) return nameAlreadyExistsText;
  } catch (error) {
    throw problemWithValidationTryAgainText;
  }
};

export const validateInternalUserName = (internalUsersService, isUpdatingName = false) => async (name) => {
  const hasDotsAndAsterisks = (/[\.\*]/gm).test(name);
  if (hasDotsAndAsterisks) throw nameMustNotContainDotsAndAsterisksText;
  try {
    const message = await validateName(internalUsersService, isUpdatingName)(name);
    if (message) throw message;
  } catch (error) {
    throw error;
  }
};

export const validateESDLSQuery = (index, httpClient) => async (query) => {
  if (isEmpty(query)) return;

  let _query;
  try {
    _query = JSON.parse(query);
  } catch (error) {
    return jsonIsInvalidText;
  }

  _query = JSON.stringify({ query: _query });

  try {
    const { data } = await httpClient.post(API.VALIDATE_DLS + `/${encodeURIComponent(index)}`, _query);
    if (!data.valid) {
      return dlsQuerySyntaxIsInvalidText;
    }
  } catch (error) {
    throw problemWithValidationTryAgainText;
  }
};
