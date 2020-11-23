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
import PropTypes from 'prop-types';
import { EuiAccordion, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { FieldArray } from 'formik';
import { isEmpty, get } from 'lodash';
import { addText, advancedText } from '../../../utils/i18n/common';
import {
  emptyIndexExclusionsText,
  indexExclusionsText,
  indexPatternsText,
} from '../../../utils/i18n/roles';
import { actionGroupsText, singleExclusionsText } from '../../../utils/i18n/action_groups';
import {
  EmptyPrompt,
  AddButton,
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  FormikSwitch,
  Icon,
} from '../../../components';
import { validIndicesSinglePermissionOption, isInvalid, hasError } from '../../../utils/validation';
import {
  excludeIndexPermissionToUiExcludeIndexPermission,
  useIndexPatterns,
  indexPatternNames,
  renderIndexOption,
} from '../utils';
import { INDEX_EXCLUSIONS } from '../utils/constants';

import { Context } from '../../../Context';

function Exclusion({ index, values, allActionGroups, allSinglePermissions }) {
  const { onSwitchChange, onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption } = useContext(
    Context
  );

  const { isLoading, indexOptions, onSearchChange } = useIndexPatterns();
  const isAdvanced = get(values, `_excludeIndexPermissions[${index}]._isAdvanced`);

  return (
    <>
      <FormikComboBox
        name={`_excludeIndexPermissions[${index}].index_patterns`}
        formRow
        rowProps={{
          label: indexPatternsText,
        }}
        elementProps={{
          isLoading,
          onSearchChange,
          async: true,
          isClearable: true,
          placeholder: 'Select indices',
          options: indexOptions,
          renderOption: renderIndexOption,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption(),
        }}
      />
      <FormikComboBox
        name={`_excludeIndexPermissions[${index}].actions.actiongroups`}
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
        name={`_excludeIndexPermissions[${index}]._isAdvanced`}
      />
      {isAdvanced && (
        <FormikComboBox
          name={`_excludeIndexPermissions[${index}].actions.permissions`}
          formRow
          rowProps={{
            label: singleExclusionsText,
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
    </>
  );
}

function Exclusions({ values, arrayHelpers, allActionGroups, allSinglePermissions }) {
  const { triggerConfirmDeletionModal } = useContext(Context);

  return values._excludeIndexPermissions.map((indexPermission, index) => (
    <EuiFlexGroup key={index}>
      <EuiFlexItem>
        <EuiAccordion
          data-test-subj={`sgRoleIndexPatternsAccordion-${index}`}
          id={index.toString(2)}
          className="euiAccordionForm"
          buttonClassName="euiAccordionForm__button"
          extraAction={
            <AccordionDeleteButton
              onClick={() => {
                triggerConfirmDeletionModal({
                  body: indexPatternNames(indexPermission.index_patterns),
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
              subduedText={indexPatternNames(indexPermission.index_patterns)}
            />
          }
        >
          <EuiSpacer />
          <Exclusion
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

export function IndexExclusions({ values, allActionGroups, allSinglePermissions }) {
  function addIndexPermission(arrayHelpers) {
    arrayHelpers.push(excludeIndexPermissionToUiExcludeIndexPermission(INDEX_EXCLUSIONS));
  }

  return (
    <FieldArray name="_excludeIndexPermissions">
      {(arrayHelpers) => (
        <Fragment>
          <AddButton onClick={() => addIndexPermission(arrayHelpers)} />
          <EuiSpacer />

          {isEmpty(values._excludeIndexPermissions) ? (
            <EmptyPrompt
              titleText={indexExclusionsText}
              bodyText={emptyIndexExclusionsText}
              createButtonText={addText}
              onCreate={() => {
                addIndexPermission(arrayHelpers);
              }}
            />
          ) : (
            <Exclusions
              values={values}
              arrayHelpers={arrayHelpers}
              allActionGroups={allActionGroups}
              allSinglePermissions={allSinglePermissions}
            />
          )}
        </Fragment>
      )}
    </FieldArray>
  );
}

IndexExclusions.propTypes = {
  values: PropTypes.shape({
    _excludeIndexPermissions: PropTypes.arrayOf(
      PropTypes.shape({
        index_patterns: PropTypes.array.isRequired,
        actions: PropTypes.shape({
          actiongroups: PropTypes.array.isRequired,
          permissions: PropTypes.array.isRequired,
        }),
      })
    ).isRequired,
  }).isRequired,
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
};
