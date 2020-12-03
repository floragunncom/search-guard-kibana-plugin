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

import fieldNamesToUiFieldNames from './field_names_to_ui_field_names';
import { arrayToComboBoxOptions } from '../../../../../../utils/helpers';

describe('field names to UI field names', () => {
  test(`can build UI field names`, () => {
    const fieldNames = {
      alias: new Set(['@timestamp']),
      date: new Set(['customer_birth_date', 'products.created_on', 'utc_time']),
      double: new Set(['memory']),
      geo_point: new Set(['geoip.location', 'geo.coordinates']),
      half_float: new Set(['products.base_price']),
      integer: new Set(['day_of_week_i']),
      ip: new Set(['clientip']),
      keyword: new Set(['currency', 'geoip.city_name', 'geo.dest']),
      long: new Set(['bytes', 'machine.ram']),
      text: new Set(['customer_first_name', 'products._id', 'agent', 'machine.os']),
    };

    const uiFieldNames = [
      { label: 'Alias', options: arrayToComboBoxOptions(['@timestamp']) },
      {
        label: 'Date',
        options: arrayToComboBoxOptions(['customer_birth_date', 'products.created_on', 'utc_time']),
      },
      { label: 'Double', options: arrayToComboBoxOptions(['memory']) },
      {
        label: 'Geo Point',
        options: arrayToComboBoxOptions(['geoip.location', 'geo.coordinates']),
      },
      { label: 'Half Float', options: arrayToComboBoxOptions(['products.base_price']) },
      { label: 'Integer', options: arrayToComboBoxOptions(['day_of_week_i']) },
      { label: 'Ip', options: arrayToComboBoxOptions(['clientip']) },
      {
        label: 'Keyword',
        options: arrayToComboBoxOptions(['currency', 'geoip.city_name', 'geo.dest']),
      },
      { label: 'Long', options: arrayToComboBoxOptions(['bytes', 'machine.ram']) },
      {
        label: 'Text',
        options: arrayToComboBoxOptions([
          'customer_first_name',
          'products._id',
          'agent',
          'machine.os',
        ]),
      },
    ];

    expect(fieldNamesToUiFieldNames(fieldNames)).toEqual(uiFieldNames);
  });
});
