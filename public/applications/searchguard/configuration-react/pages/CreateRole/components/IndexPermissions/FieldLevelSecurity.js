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

import React, { Fragment, useContext } from 'react';
import { connect } from 'formik';
import PropTypes from 'prop-types';
import { EuiSpacer, EuiFlexItem, EuiFlexGroup, EuiCallOut, EuiText } from '@elastic/eui';
import { FormikRadio, FormikComboBox, SubHeader } from '../../../../components';
import {
  fieldLevelSecurityText,
  includeOrExcludeFieldsText,
  fieldLevelSecurityDisabledText,
  createRoleFieldLevelSecurityHelpText,
} from '../../../../utils/i18n/roles';
import { includeText, excludeText } from '../../../../utils/i18n/common';
import { FLS_MODES } from '../../utils/constants';

import { Context } from '../../../../Context';

function FieldLevelSecurity({ formik: { values }, index, allIndexPatternsFields, isLoading }) {
  const { configService, onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption } = useContext(
    Context
  );
  const { _indexPermissions } = values;
  const isFlsEnabled = configService.dlsFlsEnabled();

  function renderFeatureDisabledCallout() {
    return (
      <Fragment>
        <EuiSpacer />
        <EuiCallOut
          data-test-subj="sgFLSDisabledCallout"
          className="sgFixedFormItem"
          iconType="iInCircle"
          title={fieldLevelSecurityDisabledText}
        />
      </Fragment>
    );
  }

  return !isFlsEnabled ? (
    renderFeatureDisabledCallout()
  ) : (
    <Fragment>
      <EuiSpacer />
      <SubHeader
        title={<h5>{fieldLevelSecurityText}</h5>}
        description={<EuiText size="s">{createRoleFieldLevelSecurityHelpText}</EuiText>}
      />
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <FormikRadio
            name={`_indexPermissions[${index}].flsmode`}
            formRow
            elementProps={{
              // Radio id must be unique through all accordion items!
              id: `${FLS_MODES.WHITELIST}_${index}`,
              label: includeText,
              checked: _indexPermissions[index].flsmode === FLS_MODES.WHITELIST,
              onChange: ({ target: { id } }, field, form) => {
                const flsmode = id.split('_')[0];
                form.setFieldValue(field.name, flsmode);
              },
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <FormikRadio
            name={`_indexPermissions[${index}].flsmode`}
            formRow
            elementProps={{
              // Radio id must be unique through all accordion items!
              id: `${FLS_MODES.BLACKLIST}_${index}`,
              label: excludeText,
              checked: _indexPermissions[index].flsmode === FLS_MODES.BLACKLIST,
              onChange: ({ target: { id } }, field, form) => {
                const flsmode = id.split('_')[0];
                form.setFieldValue(field.name, flsmode);
              },
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />

      <FormikComboBox
        name={`_indexPermissions[${index}].fls`}
        formRow
        rowProps={{
          helpText: includeOrExcludeFieldsText,
        }}
        elementProps={{
          placeholder: 'Add index pattern(s) to fetch the field names here',
          isLoading,
          options: allIndexPatternsFields,
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption(),
        }}
      />
    </Fragment>
  );
}

FieldLevelSecurity.propTypes = {
  index: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  formik: PropTypes.shape({
    values: PropTypes.object.isRequired,
  }).isRequired,
  allIndexPatternsFields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string })),
    })
  ),
};

export default connect(FieldLevelSecurity);
