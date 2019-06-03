import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTitle,
  EuiCallOut
} from '@elastic/eui';
import { advancedText } from '../../../../utils/i18n/common';
import {
  indexPatternsText,
  elasticsearhQueryDSLText,
  documentLevelSecurityText,
  fieldLevelSecurityDisabledText,
  documentLevelSecurityDisabledText
} from '../../../../utils/i18n/roles';
import { actionGroupsText, singlePermissionsText } from '../../../../utils/i18n/action_groups';
import {
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  FormikSwitch,
  FormikCodeEditor
} from '../../../../components';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';
import { isInvalid, hasError, validateESDSL } from '../../../../utils/validation';
import FieldLevelSecurity from './FieldLevelSecurity';

const indexPatternNames = (indexPatterns = []) => comboBoxOptionsToArray(indexPatterns).join(', ');

const IndexPatterns = ({
  indexPermissions,
  arrayHelpers,
  allActionGroups,
  allSinglePermissions,
  allIndices,
  isDlsEnabled,
  isFlsEnabled,
  isAnonymizedFieldsEnabled,
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
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
                  onBlur: onComboBoxOnBlur,
                  onChange: onComboBoxChange,
                  onCreateOption: onComboBoxCreateOption
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
                  options: allActionGroups,
                  isClearable: true,
                  onBlur: onComboBoxOnBlur,
                  onChange: onComboBoxChange
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
                options: allSinglePermissions,
                isClearable: true,
                onBlur: onComboBoxOnBlur,
                onChange: onComboBoxChange
              }}
            />
          }
          <EuiSpacer />

          {!isFlsEnabled ? (
            <EuiCallOut className="sgFixedFormItem" iconType="iInCircle" title={fieldLevelSecurityDisabledText} />
          ) : (
            <Fragment>
              <FieldLevelSecurity
                indexPermission={indexPermission}
                index={index}
                isAnonymizedFieldsEnabled={isAnonymizedFieldsEnabled}
                onComboBoxChange={onComboBoxChange}
                onComboBoxOnBlur={onComboBoxOnBlur}
                onComboBoxCreateOption={onComboBoxCreateOption}
              />
              <EuiSpacer />
            </Fragment>
          )}
          <EuiSpacer />

          {!isDlsEnabled ? (
            <EuiCallOut className="sgFixedFormItem" iconType="iInCircle" title={documentLevelSecurityDisabledText} />
          ) : (
            <Fragment>
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
            </Fragment>
          )}
          <EuiSpacer />

        </EuiAccordion>
      </EuiFlexItem>
    </EuiFlexGroup>
  ))
);

IndexPatterns.propTypes = {
  indexPermissions: PropTypes.array.isRequired,
  arrayHelpers: PropTypes.object.isRequired,
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
  allIndices: PropTypes.array.isRequired,
  isDlsEnabled: PropTypes.bool.isRequired,
  isFlsEnabled: PropTypes.bool.isRequired,
  isAnonymizedFieldsEnabled: PropTypes.bool.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

export default IndexPatterns;
