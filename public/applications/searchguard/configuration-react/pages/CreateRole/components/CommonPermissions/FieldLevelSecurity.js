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
import { connect, FieldArray } from 'formik';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import {
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiCallOut,
  EuiLink,
  EuiButton,
  EuiFormRow,
} from '@elastic/eui';
import {
  FormikRadio,
  FormikComboBox,
  SubHeader,
  FormikSwitch,
  FormikSelect,
  FormikFieldText,
} from '../../../../components';
import {
  fieldLevelSecurityText,
  includeOrExcludeFieldsText,
  anonymizedFieldsDisabledText,
  fieldLevelSecurityDisabledText,
  anonymizeText,
  anonymizeHelpText,
  maskTypeText,
  regularExpressionText,
  hashText,
} from '../../../../utils/i18n/roles';
import {
  includeText,
  excludeText,
  advancedText,
  documentationText,
  removeText,
  addText,
} from '../../../../utils/i18n/common';
import { validateMaskedFields, validateMaskedFieldsRegexMask } from '../../utils';
import {
  MASKED_FIELD_TYPE_OPTIONS,
  MASKED_FIELD_TYPE,
  FLS_MODES,
  MASKED_FIELDS_DEFAULTS, COMMON_PERMISSION_TYPES
} from "../../utils/constants";
import { hasError, isInvalid } from '../../../../utils/validation';

import { Context } from '../../../../Context';

function AnonymizedFieldsAdvanced({ type = COMMON_PERMISSION_TYPES.INDEX_PERMISSION, index, isLoading, allIndexPatternsFields }) {
  const { onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption } = useContext(Context);

  function helpText() {
    return (
      <>
        {anonymizeHelpText}{' '}
        <EuiLink
          href="https://docs.search-guard.com/latest/field-anonymization#anonymize-fields-in-elasticsearch-documents"
          target="_blank"
        >
          {documentationText}
        </EuiLink>
      </>
    );
  }

  return (
    <FormikComboBox
      name={`${type.permissionsProperty}[${index}].masked_fields_advanced`}
      formRow
      rowProps={{
        helpText: helpText(),
        label: anonymizeText,
      }}
      elementProps={{
        placeholder: type.flsPatternPlaceholder,
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

function AnonymizedFields({ type = COMMON_PERMISSION_TYPES.INDEX_PERMISSION, values, index, isLoading, allIndexPatternsFields }) {
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
  const currentPermission = values[type.permissionsProperty][index];
  const currentPermissionPath = `${type.permissionsProperty}[${index}]`;

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

  function helpText() {
    return (
      <EuiLink
        href="https://docs.search-guard.com/latest/field-anonymization#anonymize-fields-in-elasticsearch-documents"
        target="_blank"
      >
        {documentationText}
      </EuiLink>
    );
  }

  function renderMaskFields({ index, isLoading }) {
    return (
      <FormikComboBox
        name={`${currentPermissionPath}.masked_fields[${index}].fields`}
        formRow
        rowProps={{
          helpText: helpText(),
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
        name={`${currentPermissionPath}.masked_fields[${index}].mask_type`}
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
        name={`${currentPermissionPath}.masked_fields[${index}].value`}
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
        name={`${currentPermissionPath}.masked_fields[${index}].value`}
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

    const isRegexMask = currentPermission.masked_fields[index].mask_type === MASKED_FIELD_TYPE.REGEX;
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
        <FieldArray name={`${currentPermissionPath}.masked_fields`} validateOnChange={false}>
          {(arrayHelpers) => {
            return (
              <EuiFlexGroup direction="column" alignItems="flexStart">
                {currentPermission.masked_fields.map((item, index) => {
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

  return !isAnonymizedFieldsEnabled ? (
    renderFeatureDisabledCallout()
  ) : (
    <>
      {currentPermission._isAdvancedFLSMaskedFields ? (
        <AnonymizedFieldsAdvanced
          type={type}
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
        name={`${currentPermissionPath}._isAdvancedFLSMaskedFields`}
      />
    </>
  );
}

function FieldLevelSecurity({ type = COMMON_PERMISSION_TYPES.INDEX_PERMISSION, formik: { values }, index, allIndexPatternsFields, isLoading }) {
  const { configService, onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption } = useContext(
    Context
  );
  const allPermissions = values[type.permissionsProperty];
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
      <SubHeader title={<h4>{fieldLevelSecurityText}</h4>} />
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <FormikRadio
            name={`${type.permissionsProperty}[${index}].flsmode`}
            formRow
            elementProps={{
              // Radio id must be unique through all accordion items!
              id: `${FLS_MODES.WHITELIST}_${index}`,
              label: includeText,
              checked: allPermissions[index].flsmode === FLS_MODES.WHITELIST,
              onChange: ({ target: { id } }, field, form) => {
                const flsmode = id.split('_')[0];
                form.setFieldValue(field.name, flsmode);
              },
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <FormikRadio
            name={`${type.permissionsProperty}[${index}].flsmode`}
            formRow
            elementProps={{
              // Radio id must be unique through all accordion items!
              id: `${FLS_MODES.BLACKLIST}_${index}`,
              label: excludeText,
              checked: allPermissions[index].flsmode === FLS_MODES.BLACKLIST,
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
        name={`${type.permissionsProperty}[${index}].fls`}
        formRow
        rowProps={{
          helpText: includeOrExcludeFieldsText,
        }}
        elementProps={{
          placeholder: type.flsPatternPlaceholder,
          isLoading,
          options: allIndexPatternsFields,
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption(),
        }}
      />
      <AnonymizedFields
        type={type}
        values={values}
        index={index}
        isLoading={isLoading}
        allIndexPatternsFields={allIndexPatternsFields}
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
