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

import React from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import { FormikComboBox } from '../../../../../components';
import {
  buildProxyOptions,
  findSelectedProxyOption,
  DEFAULT_PROXY_LABEL,
} from './utils/buildProxyOptions';
import { proxyText } from '../../../../../utils/i18n/account';
import { proxyHelpText } from '../../../../../utils/i18n/watch';

// The Formik value is the plain "proxy" string of the action, so JSON watches round-trip unchanged.
const ActionProxy = ({ isResolveActions, index, proxies, formik: { values } }) => {
  const path = isResolveActions ? `resolve_actions[${index}].proxy` : `actions[${index}].proxy`;
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
          form.setFieldValue(field.name, option ? option.value : '');
        },
        onCreateOption: (value, field, form) => {
          form.setFieldValue(field.name, value.trim());
        },
        customOptionText: 'Use {searchValue} as proxy',
        'data-test-subj': 'sgProxyComboBox',
      }}
    />
  );
};

ActionProxy.defaultProps = {
  isResolveActions: false,
  proxies: [],
};

ActionProxy.propTypes = {
  isResolveActions: PropTypes.bool,
  index: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  proxies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      uri: PropTypes.string,
    })
  ),
};

export default connectFormik(ActionProxy);
