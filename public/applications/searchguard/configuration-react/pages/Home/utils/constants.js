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

export const ENDPOINTS = {
  INTERNALUSERS: 'INTERNALUSERS',
  ROLESMAPPING: 'ROLESMAPPING',
  ROLES: 'ROLES',
  ACTIONGROUPS: 'ACTIONGROUPS',
  TENANTS: 'TENANTS',
  SGCONFIG: 'SGCONFIG',
  LICENSE: 'LICENSE',
  CACHE: 'CACHE',
};

export const METHODS_FOR_ENDPOINTS = {
  [ENDPOINTS.INTERNALUSERS]: 'GET',
  [ENDPOINTS.ROLESMAPPING]: 'GET',
  [ENDPOINTS.ACTIONGROUPS]: 'GET',
  [ENDPOINTS.TENANTS]: 'GET',
  [ENDPOINTS.SGCONFIG]: 'GET',
  [ENDPOINTS.LICENSE]: 'GET',
  [ENDPOINTS.CACHE]: 'GET',
};
