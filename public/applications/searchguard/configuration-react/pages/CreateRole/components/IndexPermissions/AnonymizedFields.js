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

import React, { useContext } from 'react';
import { FieldArray, connect } from 'formik';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import {
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiCallOut,
  EuiButton,
  EuiFormRow,
  EuiText,
} from '@elastic/eui';
import {
  FormikComboBox,
  SubHeader,
  FormikSwitch,
  FormikSelect,
  FormikFieldText,
} from '../../../../components';
import {
  anonymizedFieldsDisabledText,
  anonymizeText,
  anonymizeHelpText,
  maskTypeText,
  regularExpressionText,
  hashText,
  fieldAnonymizationText,
  createRoleFieldAnonymizationHelpText,
} from '../../../../utils/i18n/roles';
import { advancedText, removeText, addText } from '../../../../utils/i18n/common';
import { validateMaskedFields, validateMaskedFieldsRegexMask } from '../../utils';
import {
  MASKED_FIELD_TYPE_OPTIONS,
  MASKED_FIELD_TYPE,
  MASKED_FIELDS_DEFAULTS,
} from '../../utils/constants';
import { hasError, isInvalid } from '../../../../utils/validation';

import { Context } from '../../../../Context';

function AnonymizedFieldsAdvanced({ index, isLoading, allIndexPatternsFields }) {
  const { onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption } = useContext(Context);

  return (
    <FormikComboBox
      name={`_indexPermissions[${index}].masked_fields_advanced`}
      formRow
      rowProps={{
        label: anonymizeText,
        helpText: anonymizeHelpText,
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
  );
}

function AnonymizedFields({ formik: { values }, index, isLoading, allIndexPatternsFields }) {
  const {
    configService,
    onSwitchChange,
    triggerConfirmDeletionModal,
    onComboBoxOnBlur,
    onComboBoxChange,
    onComboBoxCreateOption,
    onSelectChange,
  } = useContext(Context);
  const isAnonymizedFieldsEnabled = configService.complianceFeaturesEnabled();
  const indexPermission = values._indexPermissions[index];
  const indexPermissionPath = `_indexPermissions[${index}]`;

  function renderFeatureDisabledCallout() {
    return (
      <EuiCallOut
        data-test-subj="sgAnonymFieldsDisabledCallout"
        className="sgFixedFormItem"
        iconType="iInCircle"
        title={anonymizedFieldsDisabledText}
      />
    );
  }

  function renderMaskFields({ index, isLoading }) {
    return (
      <FormikComboBox
        name={`${indexPermissionPath}.masked_fields[${index}].fields`}
        formRow
        rowProps={{
          label: anonymizeText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          placeholder: 'Add index pattern(s) to fetch the field names here',
          isInvalid,
          isLoading,
          options: allIndexPatternsFields,
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption(),
        }}
        formikFieldProps={{
          validate: validateMaskedFields,
        }}
      />
    );
  }

  function renderMaskType({ index, isLoading }) {
    return (
      <FormikSelect
        name={`${indexPermissionPath}.masked_fields[${index}].mask_type`}
        formRow
        rowProps={{
          label: maskTypeText,
        }}
        elementProps={{
          isLoading,
          onChange: onSelectChange,
          options: MASKED_FIELD_TYPE_OPTIONS,
        }}
      />
    );
  }

  function renderMaskRegexValue({ index }) {
    return (
      <FormikFieldText
        name={`${indexPermissionPath}.masked_fields[${index}].value`}
        formRow
        rowProps={{
          label: regularExpressionText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          placeholder: '/regex/::replacement string',
          isInvalid,
        }}
        formikFieldProps={{
          validate: validateMaskedFieldsRegexMask,
        }}
      />
    );
  }

  function renderMaskHashValue({ index }) {
    return (
      <FormikFieldText
        name={`${indexPermissionPath}.masked_fields[${index}].value`}
        formRow
        rowProps={{
          label: hashText,
        }}
        elementProps={{
          disabled: true,
          readOnly: true,
        }}
      />
    );
  }

  function renderMaskValue({ item, index }) {
    let Value = null;

    const isRegexMask = indexPermission.masked_fields[index].mask_type === MASKED_FIELD_TYPE.REGEX;
    if (isRegexMask) {
      Value = renderMaskRegexValue({ index });
    } else if (item.value) {
      Value = renderMaskHashValue({ index });
    }

    if (!Value) return null;
    return <EuiFlexItem style={{ minWidth: 400 }}>{Value}</EuiFlexItem>;
  }

  function removeMaskFields(index, arrayHelpers) {
    triggerConfirmDeletionModal({
      onConfirm: () => {
        arrayHelpers.remove(index);
        triggerConfirmDeletionModal(null);
      },
    });
  }

  function renderAnonimizedFields({ isLoading }) {
    return (
      <div id={`sgMaskedFields-${index}`}>
        <EuiSpacer size="m" />
        <FieldArray name={`${indexPermissionPath}.masked_fields`} validateOnChange={false}>
          {(arrayHelpers) => {
            return (
              <EuiFlexGroup direction="column" alignItems="flexStart">
                {indexPermission.masked_fields.map((item, index) => {
                  return (
                    <EuiFlexItem key={`masked_fields.${index}`}>
                      <EuiFlexGroup alignItems="flexStart">
                        <EuiFlexItem style={{ minWidth: 400 }}>
                          {renderMaskFields({ index, isLoading })}
                        </EuiFlexItem>
                        <EuiFlexItem style={{ width: 180 }}>
                          {renderMaskType({ index, isLoading })}
                        </EuiFlexItem>
                        {renderMaskValue({ item, index })}
                        <EuiFlexItem grow={false}>
                          <EuiFormRow hasEmptyLabelSpace>
                            <EuiButton
                              fill
                              data-test-subj={`sgMaskedFields_remove-${index}`}
                              size="s"
                              color="danger"
                              iconType="trash"
                              onClick={() => removeMaskFields(index, arrayHelpers)}
                            >
                              {removeText}
                            </EuiButton>
                          </EuiFormRow>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                  );
                })}
                <EuiFlexItem>
                  <EuiButton
                    data-test-subj="sgMaskedFields_add"
                    size="s"
                    onClick={() => {
                      arrayHelpers.push(cloneDeep(MASKED_FIELDS_DEFAULTS));
                    }}
                    iconType="plusInCircle"
                  >
                    {addText}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            );
          }}
        </FieldArray>
        <EuiSpacer />
      </div>
    );
  }

  return (
    <>
      <SubHeader
        title={<h5>{fieldAnonymizationText}</h5>}
        description={<EuiText size="s">{createRoleFieldAnonymizationHelpText}</EuiText>}
      />
      {!isAnonymizedFieldsEnabled ? (
        renderFeatureDisabledCallout()
      ) : (
        <>
          {indexPermission._isAdvancedFLSMaskedFields ? (
            <AnonymizedFieldsAdvanced
              index={index}
              isLoading={isLoading}
              allIndexPatternsFields={allIndexPatternsFields}
            />
          ) : (
            renderAnonimizedFields({ isLoading })
          )}
          <FormikSwitch
            formRow
            elementProps={{
              label: advancedText,
              onChange: onSwitchChange,
            }}
            name={`_indexPermissions[${index}]._isAdvancedFLSMaskedFields`}
          />
        </>
      )}
    </>
  );
}

AnonymizedFields.propTypes = {
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

export default connect(AnonymizedFields);
