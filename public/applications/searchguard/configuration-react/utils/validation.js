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
import { passwordsDontMatchText } from './i18n/internal_users';
import {
  requiredText,
  problemWithValidationTryAgainText,
  nameAlreadyExistsText,
  forbiddenCharsText,
  indicesPermissionsPrefixErrorText,
  clusterPermissionsPrefixErrorText,
  permissionsPrefixErrorText,
} from './i18n/common';

export const validatePassword = (passwordConfirmation) => (password) => {
  if (!password) return requiredText;
  if (password !== passwordConfirmation) return passwordsDontMatchText;
};

export const validateTextField = (value) => {
  if (!value) return requiredText;
};

/**
 * Creates a generic name validation function for different resources.
 *
 * @param {Object} Service - The http service for the given resource
 * @param {boolean} [isUpdatingName=false]
 * @param {Object} [options={}] - Validation options
 * @param {boolean} [options.skipForbiddenChars=false] - If true, skips forbidden characters validation
 * @param {RegExp} [options.forbiddenCharsPattern=/[\.*]/gm] - Custom regex pattern for forbidden characters
 * @returns {Function} An async validation function that takes a name string and returns null if valid, or an error message string if invalid
 *
 */
export const validateName = (Service, isUpdatingName = false, options = {}) => async (name) => {
  if (!name) return requiredText;

  // Check forbidden chars unless explicitly disabled
  if (options.skipForbiddenChars !== true) {
    const forbiddenCharsPattern = options.forbiddenCharsPattern || /[\.*]/gm;
    const hasForbiddenChars = forbiddenCharsPattern.test(name);
    if (hasForbiddenChars) return forbiddenCharsText;
  }

  try {
    const { data } = await Service.list();
    const newNameAlreadyExists = isUpdatingName && Object.keys(data).includes(name);
    if (newNameAlreadyExists) return nameAlreadyExistsText;
  } catch (error) {
    return problemWithValidationTryAgainText;
  }
  return null;
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
