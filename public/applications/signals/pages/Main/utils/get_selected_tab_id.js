/*
 *    Copyright 2026 floragunn GmbH
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

import { APP_PATH } from '../../../utils/constants';

export const getSelectedTabId = (pathname) => {
  if (pathname === APP_PATH.TENANT_ACCOUNTS) return APP_PATH.TENANT_ACCOUNTS;
  if (pathname === APP_PATH.ACCOUNTS) return APP_PATH.ACCOUNTS;
  if (pathname.includes(APP_PATH.WATCHES)) return APP_PATH.WATCHES;
  if (pathname.includes(APP_PATH.SIGNALS_OPERATOR_VIEW)) return APP_PATH.SIGNALS_OPERATOR_VIEW;
  return APP_PATH.WATCHES;
};
