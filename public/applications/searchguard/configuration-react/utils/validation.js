/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { isEmpty } from 'lodash';
import {
  nameMustNotContainDotsAndAsterisksText,
  passwordsDontMatchText,
} from './i18n/internal_users';
import {
  requiredText,
  problemWithValidationTryAgainText,
  nameAlreadyExistsText,
  nameMustNotContainDotsText,
  jsonIsInvalidText,
  indicesPermissionsPrefixErrorText,
  clusterPermissionsPrefixErrorText,
  permissionsPrefixErrorText,
} from './i18n/common';
import { dlsQuerySyntaxIsInvalidText } from './i18n/roles';
import { API } from './constants';

export const validatePassword = (passwordConfirmation) => (password) => {
  if (!password) return requiredText;
  if (password !== passwordConfirmation) return passwordsDontMatchText;
};

export const validateTextField = (value) => {
  if (!value) return requiredText;
};

export const validateName = (Service, isUpdatingName = false) => async (name) => {
  if (!name) return requiredText;
  const hasDots = /[\.]/gm.test(name);
  if (hasDots) return nameMustNotContainDotsText;
  try {
    const { data } = await Service.list();
    const newNameAlreadyExists = isUpdatingName && Object.keys(data).includes(name);
    if (newNameAlreadyExists) return nameAlreadyExistsText;
  } catch (error) {
    return problemWithValidationTryAgainText;
  }
};

export const validateInternalUserName = (internalUsersService, isUpdatingName = false) => async (
  name
) => {
  const hasDotsAndAsterisks = /[\.\*]/gm.test(name);
  if (hasDotsAndAsterisks) return nameMustNotContainDotsAndAsterisksText;
  const message = await validateName(internalUsersService, isUpdatingName)(name);
  return message;
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
    const { data } = await httpClient.post(
      API.VALIDATE_DLS + `/${encodeURIComponent(index)}`,
      _query
    );
    if (!data.valid) {
      return dlsQuerySyntaxIsInvalidText;
    }
  } catch (error) {
    return problemWithValidationTryAgainText;
  }
};

export const validateEmptyComboBox = (value) => {
  if (isEmpty(value)) return requiredText;
};

export function validClusterSinglePermissionOption(options = []) {
  if (options.some(({ label } = {}) => !/^cluster:[\w\*].*/.test(label))) {
    return clusterPermissionsPrefixErrorText;
  }
  return null;
}

export function validIndicesSinglePermissionOption(options = []) {
  if (options.some(({ label } = {}) => !/^indices:[\w\*].*/.test(label))) {
    return indicesPermissionsPrefixErrorText;
  }
  return null;
}

export function validSinglePermissionOption(options = []) {
  if (options.some(({ label } = {}) => !/^((cluster)|(indices)):[\w\*].*/.test(label))) {
    return permissionsPrefixErrorText;
  }
  return null;
}

export * from '../../../utils/validate';
