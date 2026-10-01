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

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import { FormikComboBox } from '../../../../components';
import {
  buildProxyOptions,
  findSelectedProxyOption,
  toProxyValue,
  DEFAULT_PROXY_LABEL,
} from './utils/buildProxyOptions';
import { ProxiesContext } from './ProxiesContext';
import { proxyText } from '../../../../utils/i18n/account';
import { proxyHelpText } from '../../../../utils/i18n/watch';

// The Formik value is the plain "proxy" string of the action or check, so JSON watches round-trip unchanged.
const ProxyField = ({ path, formik: { values } }) => {
  const proxies = useContext(ProxiesContext);
  const options = buildProxyOptions(proxies);
  const selectedOptions = findSelectedProxyOption(get(values, path), options);

  return (
    <FormikComboBox
      name={path}
      formRow
      rowProps={{
        label: proxyText,
        helpText: proxyHelpText,
        style: { paddingLeft: '0px' },
      }}
      elementProps={{
        isClearable: true,
        singleSelection: { asPlainText: true },
        placeholder: DEFAULT_PROXY_LABEL,
        options,
        selectedOptions,
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
        onChange: ([option] = [], field, form) => {
          form.setFieldValue(field.name, toProxyValue(option));
        },
        onCreateOption: (value, field, form) => {
          form.setFieldValue(field.name, value.trim() || undefined);
        },
        customOptionText: 'Use {searchValue} as proxy',
        'data-test-subj': 'sgProxyComboBox',
      }}
    />
  );
};

ProxyField.propTypes = {
  path: PropTypes.string.isRequired,
  formik: PropTypes.object.isRequired,
};

export default connectFormik(ProxyField);
