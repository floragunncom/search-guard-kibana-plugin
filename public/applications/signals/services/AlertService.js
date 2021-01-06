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

import queryString from 'query-string';
import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class AlertService extends SignalsService {
  search(query = {}) {
    return super.post(`..${ROUTE_PATH.ALERTS}`, { query });
  }

  delete({ id, index }) {
    return super.delete(encodeURI(`..${ROUTE_PATH.ALERT}/${index}/${id}`));
  }
}
