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
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import { ALIAS_PERMISSION, INDEX_PERMISSION } from "../../utils/constants";
import { EuiAccordion, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { advancedText, addText } from '../../../../utils/i18n/common';
import {
  emptyAliasPermissionsText,
  aliasPermissionsText,
  indexPatternsText, aliasPatternsText
} from "../../../../utils/i18n/roles";
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
  aliasPermissionToUiAliasPermission,
  useIndexPatterns,
  indexPatternNames,
  renderIndexOption,
  fieldNamesToUiFieldNames,
  mappingsToFieldNames,
} from '../../utils';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';
import { ElasticsearchService } from '../../../../services';

import { Context } from '../../../../Context';

function Permission({ index, values, allActionGroups, allSinglePermissions }) {
  const {
    httpClient,
    addErrorToast,
    onSwitchChange,
    onComboBoxChange,
    onComboBoxOnBlur,
    onComboBoxCreateOption,
  } = useContext(Context);
  const { isLoading, setIsLoading, indexOptions, onSearchChange } = useIndexPatterns(values);
  const [prevIndexPatterns, setPrevIndexPatterns] = useState([]);
  const [allIndexPatternsFields, setAllIndexPatternsFields] = useState([]);
  const esService = new ElasticsearchService(httpClient);

  async function fetchIndexPatternsFields({ indexPatterns = [] } = {}) {
    if (!indexPatterns.length) return;
    if (isEqual(indexPatterns, prevIndexPatterns)) return;

    setPrevIndexPatterns(indexPatterns);
    setIsLoading(true);

    try {
      const { data: { mappings = {} } = {} } = await esService.getIndexMappings(
        comboBoxOptionsToArray(indexPatterns)
      );

      setAllIndexPatternsFields(fieldNamesToUiFieldNames(mappingsToFieldNames(mappings)));
    } catch (error) {
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    console.log('What are the aliasPermissions?', values._aliasPermissions)
    fetchIndexPatternsFields({ indexPatterns: values._aliasPermissions[index].alias_patterns });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <FormikComboBox
        name={`_aliasPermissions[${index}].index_patterns`}
        formRow
        rowProps={{
          label: aliasPatternsText,
        }}
        elementProps={{
          isLoading,
          onSearchChange,
          async: true,
          isClearable: true,
          placeholder: 'Select aliases',
          options: indexOptions,
          renderOption: renderIndexOption,
          onBlur: onComboBoxOnBlur,
          onChange: (options, field, form) => {
            fetchIndexPatternsFields({ indexPatterns: options });
            onComboBoxChange()(options, field, form);
          },
          onCreateOption: onComboBoxCreateOption(),
        }}
      />
      <FormikComboBox
        name={`_aliasPermissions[${index}].allowed_actions.actiongroups`}
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
        name={`_aliasPermissions[${index}]._isAdvanced`}
      />
      {values._aliasPermissions[index]._isAdvanced && (
        <FormikComboBox
          name={`_aliasPermissions[${index}].allowed_actions.permissions`}
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
        index={index}
        isLoading={isLoading}
        allIndexPatternsFields={allIndexPatternsFields}
      />
      <DocumentLevelSecurity index={index} />
    </>
  );
}

function Permissions({ values, arrayHelpers, allActionGroups, allSinglePermissions }) {
  const { triggerConfirmDeletionModal } = useContext(Context);

  return values._aliasPermissions.map((aliasPermission, index) => (
    <EuiFlexGroup key={index}>
      <EuiFlexItem>
        <EuiAccordion
          data-test-subj={`sgRoleAliasPatternsAccordion-${index}`}
          id={index.toString(2)}
          className="euiAccordionForm"
          buttonClassName="euiAccordionForm__button"
          extraAction={
            <AccordionDeleteButton
              onClick={() => {
                triggerConfirmDeletionModal({
                  body: indexPatternNames(aliasPermission.alias_patterns),
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
              titleText={indexPatternsText}
              subduedText={indexPatternNames(aliasPermission.alias_patterns)}
            />
          }
        >
          <EuiSpacer />
          <Permission
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

const AliasPermissions = ({ values, allActionGroups, allSinglePermissions }) => {
  const addAliasPermission = (arrayHelpers) => {
    arrayHelpers.push(aliasPermissionToUiAliasPermission(ALIAS_PERMISSION));
  };

  return (
    <FieldArray name="_aliasPermissions">
      {(arrayHelpers) => (
        <Fragment>
          <AddButton onClick={() => addAliasPermission(arrayHelpers)} />
          <EuiSpacer />

          {isEmpty(values._aliasPermissions) ? (
            <EmptyPrompt
              titleText={aliasPermissionsText}
              bodyText={emptyAliasPermissionsText}
              createButtonText={addText}
              onCreate={() => {
                addAliasPermission(arrayHelpers);
              }}
            />
          ) : (
            <Permissions
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

AliasPermissions.propTypes = {
  values: PropTypes.shape({
    /*
    _excludeIndexPermissions: PropTypes.arrayOf(
      PropTypes.shape({
        index_patterns: PropTypes.array.isRequired,
        actions: PropTypes.shape({
          actiongroups: PropTypes.array.isRequired,
          permissions: PropTypes.array.isRequired,
        }),
      })
    ).isRequired,

     */
    _aliasPermissions: PropTypes.arrayOf(
      PropTypes.shape({
        alias_patterns: PropTypes.array.isRequired,
        fls: PropTypes.array.isRequired,
        masked_fields: PropTypes.array.isRequired,
        allowed_actions: PropTypes.shape({
          actiongroups: PropTypes.array.isRequired,
          permissions: PropTypes.array.isRequired,
        }),
      })
    ).isRequired,
  }).isRequired,
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
};

export default AliasPermissions;
