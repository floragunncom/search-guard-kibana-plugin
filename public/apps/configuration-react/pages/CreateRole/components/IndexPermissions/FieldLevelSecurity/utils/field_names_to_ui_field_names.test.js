import fieldNamesToUiFieldNames from './field_names_to_ui_field_names';
import { arrayToComboBoxOptions } from '../../../../../../utils/helpers';

describe('field names to UI field names', () => {
  test(`can build UI field names`, () => {
    const fieldNames = {
      alias: new Set (['@timestamp']),
      date: new Set (['customer_birth_date', 'products.created_on', 'utc_time']),
      double: new Set (['memory']),
      geo_point: new Set (['geoip.location', 'geo.coordinates']),
      half_float: new Set (['products.base_price']),
      integer: new Set (['day_of_week_i']),
      ip: new Set (['clientip']),
      keyword: new Set (['currency', 'geoip.city_name', 'geo.dest']),
      long: new Set (['bytes', 'machine.ram']),
      text: new Set (['customer_first_name', 'products._id', 'agent', 'machine.os'])
    };

    const uiFieldNames = [
      { label: 'Alias', options: arrayToComboBoxOptions(['@timestamp']) },
      { label: 'Date', options: arrayToComboBoxOptions(['customer_birth_date', 'products.created_on', 'utc_time']) },
      { label: 'Double', options: arrayToComboBoxOptions(['memory']) },
      { label: 'Geo Point', options: arrayToComboBoxOptions(['geoip.location', 'geo.coordinates']) },
      { label: 'Half Float', options: arrayToComboBoxOptions(['products.base_price']) },
      { label: 'Integer', options: arrayToComboBoxOptions(['day_of_week_i']) },
      { label: 'Ip', options: arrayToComboBoxOptions(['clientip']) },
      { label: 'Keyword', options: arrayToComboBoxOptions(['currency', 'geoip.city_name', 'geo.dest']) },
      { label: 'Long', options: arrayToComboBoxOptions(['bytes', 'machine.ram']) },
      { label: 'Text', options: arrayToComboBoxOptions(['customer_first_name', 'products._id', 'agent', 'machine.os']) }
    ];

    expect(fieldNamesToUiFieldNames(fieldNames)).toEqual(uiFieldNames);
  });
});
