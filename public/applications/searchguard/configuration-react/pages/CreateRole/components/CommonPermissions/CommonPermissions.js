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

import React, { Fragment, useContext, useState, useEffect } from 'react';
import { FieldArray } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import {
  COMMON_PERMISSION_TYPES,
  GET_COMMON_PERMISSION,
} from "../../utils/constants";
import { EuiAccordion, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { advancedText, addText } from '../../../../utils/i18n/common';
import { actionGroupsText, singlePermissionsText } from '../../../../utils/i18n/action_groups';
import {
  EmptyPrompt,
  AddButton,
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  FormikSwitch,
  Icon,
} from '../../../../components';
import {
  validIndicesSinglePermissionOption,
  isInvalid,
  hasError,
} from '../../../../utils/validation';
import FieldLevelSecurity from './FieldLevelSecurity';
import DocumentLevelSecurity from './DocumentLevelSecurity';
import {
  commonPermissionToUiCommonPermission,
  useIndexPatterns,
  indexPatternNames,
  renderIndexOption,
  fieldNamesToUiFieldNames,
  mappingsToFieldNames,
} from '../../utils';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';
import { ElasticsearchService } from '../../../../services';

import { Context } from '../../../../Context';

/**
 * These components are shared between alias
 * permissions and data stream permissions.
 *
 * In order to reduce the scope of the first part of the support
 * for the new permission types, I left index permissions as
 * unchanged as possible for now.
 *
 * We should be able to also use these components for the index permissions,
 * and that change has been prepared in the COMMON_PERMISSION_TYPES.
 *
 * These components also use some of the utilities and helper functions
 * used by the index permissions, so some of the naming may be a bit
 * confusing.
 *
 */

function Permission({ type = COMMON_PERMISSION_TYPES.INDEX_PERMISSION, index, values, allActionGroups, allSinglePermissions }) {
  const {
    httpClient,
    addErrorToast,
    onSwitchChange,
    onComboBoxChange,
    onComboBoxOnBlur,
    onComboBoxCreateOption,
  } = useContext(Context);
  const { isLoading, setIsLoading, indexOptions, aliasOptions, dataStreamOptions, onSearchChange } = useIndexPatterns(values);
  const [prevPatterns, setPrevPatterns] = useState([]);
  const [allPatternsFields, setAllPatternsFields] = useState([]);
  const esService = new ElasticsearchService(httpClient);


  async function fetchPatternsFields({ indexPatterns = [] } = {}) {
    if (!indexPatterns.length) return;
    if (isEqual(indexPatterns, prevPatterns)) return;

    setPrevPatterns(indexPatterns);
    setIsLoading(true);

    try {
      const { data: { mappings = {} } = {} } = await esService.getIndexMappings(
        comboBoxOptionsToArray(indexPatterns)
      );

      setAllPatternsFields(fieldNamesToUiFieldNames(mappingsToFieldNames(mappings)));
    } catch (error) {
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    fetchPatternsFields({ indexPatterns: values[type.permissionsProperty][index][type.patternsProperty] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let patternOptions = indexOptions;
  if (type === COMMON_PERMISSION_TYPES.ALIAS_PERMISSION) {
    patternOptions = aliasOptions;
  } else if (type === COMMON_PERMISSION_TYPES.DATA_STREAM_PERMISSION) {
    patternOptions = dataStreamOptions
  }

  return (
    <>
      <FormikComboBox
        name={`${type.permissionsProperty}[${index}].${type.patternsProperty}`}
        formRow
        rowProps={{
          label: type.textPatterns,
        }}
        elementProps={{
          isLoading,
          onSearchChange,
          async: true,
          isClearable: true,
          placeholder: type.selectPatternPlaceholder,
          options: patternOptions,
          renderOption: renderIndexOption, // TODO Rename
          onBlur: onComboBoxOnBlur,
          onChange: (options, field, form) => {
            fetchPatternsFields({ indexPatterns: options });
            onComboBoxChange()(options, field, form);
          },
          onCreateOption: onComboBoxCreateOption(),
        }}
      />

      <FormikComboBox
        name={`${type.permissionsProperty}[${index}].allowed_actions.actiongroups`}
        formRow
        rowProps={{
          label: actionGroupsText,
        }}
        elementProps={{
          options: allActionGroups,
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
        }}
      />
      <FormikSwitch
        formRow
        elementProps={{
          label: advancedText,
          onChange: onSwitchChange,
        }}
        name={`${type.permissionsProperty}[${index}]._isAdvanced`}
      />
      {values[type.permissionsProperty][index]._isAdvanced && (
        <FormikComboBox
          name={`${type.permissionsProperty}[${index}].allowed_actions.permissions`}
          formRow
          rowProps={{
            label: singlePermissionsText,
            isInvalid,
            error: hasError,
          }}
          elementProps={{
            isInvalid,
            options: allSinglePermissions,
            isClearable: true,
            onBlur: onComboBoxOnBlur,
            onCreateOption: onComboBoxCreateOption(),
            onChange: onComboBoxChange(),
          }}
          formikFieldProps={{
            validate: validIndicesSinglePermissionOption,
          }}
        />
      )}
      <FieldLevelSecurity
        type={type}
        index={index}
        isLoading={isLoading}
        allIndexPatternsFields={allPatternsFields}
      />
      <DocumentLevelSecurity type={type} index={index} />
    </>
  );
}

function Permissions({ type = COMMON_PERMISSION_TYPES.INDEX_PERMISSION, values, arrayHelpers, allActionGroups, allSinglePermissions }) {
  const { triggerConfirmDeletionModal } = useContext(Context);

  return values[type.permissionsProperty].map((permission, index) => (
    <EuiFlexGroup key={index}>
      <EuiFlexItem>
        <EuiAccordion
          data-test-subj={`${type.testSubjPrefix}PatternsAccordion-${index}`}
          id={index.toString(2)}
          className="euiAccordionForm"
          buttonClassName="euiAccordionForm__button"
          extraAction={
            <AccordionDeleteButton
              onClick={() => {
                triggerConfirmDeletionModal({
                  body: indexPatternNames(permission[type.patternsProperty]),
                  onConfirm: () => {
                    arrayHelpers.remove(index);
                    triggerConfirmDeletionModal(null);
                  },
                });
              }}
            />
          }
          buttonContent={
            <AccordionButtonContent
              iconType={<Icon size="xl" type="indexPattern" />}
              titleText={type.textPatterns}
              subduedText={indexPatternNames(permission[type.patternsProperty])}
            />
          }
        >
          <EuiSpacer />
          <Permission
            type={type}
            index={index}
            values={values}
            allActionGroups={allActionGroups}
            allSinglePermissions={allSinglePermissions}
          />

          <EuiSpacer />
        </EuiAccordion>
      </EuiFlexItem>
    </EuiFlexGroup>
  ));
}

/**
 * This is a component that can be used for
 * Index Permissions, Alias Permissions, and Data Stream Permissions
 *
 * @param values
 * @param allActionGroups
 * @param allSinglePermissions
 * @returns {Element}
 * @constructor
 */
const CommonPermissions = ({ type = COMMON_PERMISSION_TYPES.INDEX_PERMISSION, values, allActionGroups, allSinglePermissions }) => {
  const addPermission = (arrayHelpers) => {
    arrayHelpers.push(commonPermissionToUiCommonPermission(GET_COMMON_PERMISSION(type.patternsProperty), type.patternsProperty));
  };

  return (
    <FieldArray name={`${type.permissionsProperty}`}>
      {(arrayHelpers) => (
        <Fragment>
          <AddButton onClick={() => addPermission(arrayHelpers)} />
          <EuiSpacer />
          {isEmpty(values[type.permissionsProperty]) ? (
            <EmptyPrompt
              titleText={type.textPermissions}
              bodyText={type.textEmptyPermissions}
              createButtonText={addText}
              onCreate={() => {
                addPermission(arrayHelpers);
              }}
            />
          ) : (
            <Permissions
              type={type}
              values={values}
              allActionGroups={allActionGroups}
              allSinglePermissions={allSinglePermissions}
              arrayHelpers={arrayHelpers}
            />
          )}
        </Fragment>
      )}
    </FieldArray>
  );
};



export default CommonPermissions;
