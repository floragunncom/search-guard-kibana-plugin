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

import {
  WATCH_ACTION_STATUS,
  WATCH_STATUS,
  DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  DEFAULT_DATEFIELD_RANGE_QUERY_LT,
} from '../../../utils/constants';

export const TABLE_SORT_FIELD = 'execution_end';
export const TABLE_SORT_DIRECTION = 'desc';

export const DATE_PICKER = {
  REFRESH_INTERVAL: 3000, // ms
  IS_PAUSED: 'true', // Must be string because it is a URL param
};

export const DEFAULT_URL_PARAMS = {
  dateGte: DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  dateLt: DEFAULT_DATEFIELD_RANGE_QUERY_LT,
  refreshInterval: DATE_PICKER.REFRESH_INTERVAL,
  isPaused: DATE_PICKER.IS_PAUSED,
};

export const SEARCH_TIMEOUT = 1500; // ms
