import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiSpacer,
  EuiTitle
} from '@elastic/eui';
import {
  addText,
  advancedText
} from '../../../utils/i18n/common';
import {
  indexPatternsText,
  elasticsearhQueryDSLText,
  documentLevelSecurityText,
  emptyIndexPermissionsText,
  indexPermissionsText
} from '../../../utils/i18n/roles';
import { actionGroupsText, singlePermissionsText } from '../../../utils/i18n/action_groups';
import {
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  FormikSwitch,
  FormikCodeEditor,
  EmptyPrompt
} from '../../../components';
import { comboBoxOptionsToArray } from '../../../utils/helpers';
import { isInvalid, hasError, validateESDSL } from '../../../utils/validation';
import FieldLevelSecurity from './FieldLevelSecurity';
import { indexPermissionToUiIndexPermission } from '../utils';
import { INDEX_PERMISSION } from '../utils/constants';

const indexPatternNames = (indexPatterns = []) => comboBoxOptionsToArray(indexPatterns).join(', ');

const IndexPermissionsAccordion = ({
  indexPermissions,
  arrayHelpers,
  allActiongroups,
  allPermissions,
  allIndices
}) => (
  indexPermissions.map((indexPermission, index) => (
    <EuiFlexGroup key={index}>
      <EuiFlexItem>
        <EuiAccordion
          id={index.toString(2)}
          className="euiAccordionForm"
          buttonClassName="euiAccordionForm__button"
          extraAction={<AccordionDeleteButton onClick={() => { arrayHelpers.remove(index); }}/>}
          buttonContent={
            <AccordionButtonContent
              iconType="indexPatternApp"
              titleText={indexPatternsText}
              subduedText={indexPatternNames(indexPermission.index_patterns)}
            />
          }
        >
          <EuiSpacer />

          <EuiFlexGroup>
            <EuiFlexItem>
              <FormikComboBox
                name={`_indexPermissions[${index}].index_patterns`}
                formRow
                rowProps={{
                  label: indexPatternsText,
                }}
                elementProps={{
                  options: allIndices,
                  isClearable: true,
                  onBlur: (e, field, form) => {
                    form.setFieldTouched(`_indexPermissions[${index}].index_patterns`, true);
                  },
                  onChange: (options, field, form) => {
                    form.setFieldValue(`_indexPermissions[${index}].index_patterns`, options);
                  },
                  onCreateOption: (label, field, form) => {
                    const normalizedSearchValue = label.trim().toLowerCase();
                    if (!normalizedSearchValue) return;
                    form.setFieldValue(`_indexPermissions[${index}].index_patterns`, field.value.concat({ label }));
                  }
                }}
              />
            </EuiFlexItem>

            <EuiFlexItem>
              <FormikComboBox
                name={`_indexPermissions[${index}].allowed_actions.actiongroups`}
                formRow
                rowProps={{
                  label: actionGroupsText,
                }}
                elementProps={{
                  options: allActiongroups,
                  isClearable: true,
                  onBlur: (e, field, form) => {
                    form.setFieldTouched(`_indexPermissions[${index}].allowed_actions.actiongroups`, true);
                  },
                  onChange: (options, field, form) => {
                    form.setFieldValue(`_indexPermissions[${index}].allowed_actions.actiongroups`, options);
                  }
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer />

          <FormikSwitch
            formRow
            elementProps={{
              label: advancedText
            }}
            name={`_indexPermissions[${index}]._isAdvanced`}
          />
          {indexPermissions[index]._isAdvanced &&
            <FormikComboBox
              name={`_indexPermissions[${index}].allowed_actions.permissions`}
              formRow
              rowProps={{
                label: singlePermissionsText,
              }}
              elementProps={{
                options: allPermissions,
                isClearable: true,
                onBlur: (e, field, form) => {
                  form.setFieldTouched(`_indexPermissions[${index}].allowed_actions.permissions`, true);
                },
                onChange: (options, field, form) => {
                  form.setFieldValue(`_indexPermissions[${index}].allowed_actions.permissions`, options);
                }
              }}
            />
          }
          <EuiSpacer />

          <FieldLevelSecurity indexPermission={indexPermission} index={index} />
          <EuiSpacer />

          <EuiTitle size="xs"><h4>{documentLevelSecurityText}</h4></EuiTitle>
          <EuiSpacer size="s"/>

          <FormikCodeEditor
            name={`_indexPermissions[${index}]._dls`}
            formRow
            formikFieldProps={{
              validate: validateESDSL
            }}
            rowProps={{
              helpText: elasticsearhQueryDSLText,
              fullWidth: true,
              isInvalid,
              error: hasError,
            }}
            elementProps={{
              mode: 'text',
              width: '100%',
              height: '300px',
              theme: 'github',
              onChange: (dls, field, form) => {
                form.setFieldValue(`_indexPermissions[${index}]._dls`, dls);
              },
              onBlur: (e, field, form) => {
                form.setFieldTouched(`_indexPermissions[${index}]._dls`, true);
              },
            }}
          />

          <EuiSpacer />
        </EuiAccordion>
      </EuiFlexItem>
    </EuiFlexGroup>
  ))
);

const addIndexPermission = arrayHelpers => {
  arrayHelpers.push(indexPermissionToUiIndexPermission(INDEX_PERMISSION));
};

const IndexPermissions = ({
  indexPermissions,
  allActiongroups,
  allPermissions,
  allIndices
}) => (
  <FieldArray
    name="_indexPermissions"
    render={arrayHelpers => (
      <Fragment>
        <EuiButton
          onClick={() => { addIndexPermission(arrayHelpers); }}
          size="s"
          iconType="plusInCircle"
        >
          {addText}
        </EuiButton>
        <EuiSpacer />

        {isEmpty(indexPermissions) ? (
          <EmptyPrompt
            titleText={indexPermissionsText}
            bodyText={emptyIndexPermissionsText}
            createButtonText={addText}
            onCreate={() => { addIndexPermission(arrayHelpers); }}
          />
        ) : (
          <IndexPermissionsAccordion
            indexPermissions={indexPermissions}
            allActiongroups={allActiongroups}
            allPermissions={allPermissions}
            allIndices={allIndices}
            arrayHelpers={arrayHelpers}
          />
        )}
      </Fragment>
    )}
  />
);

IndexPermissions.propTypes = {
  indexPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      index_patterns: PropTypes.array.isRequired,
      fls: PropTypes.array.isRequired,
      masked_fields: PropTypes.array.isRequired,
      allowed_actions: PropTypes.shape({
        actiongroups: PropTypes.array.isRequired,
        permissions: PropTypes.array.isRequired
      })
    })
  ).isRequired,
  allActiongroups: PropTypes.array.isRequired,
  allPermissions: PropTypes.array.isRequired,
  allIndices: PropTypes.array.isRequired
};

export default IndexPermissions;
