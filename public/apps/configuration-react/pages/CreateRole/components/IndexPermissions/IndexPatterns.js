import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiCallOut
} from '@elastic/eui';
import { advancedText } from '../../../../utils/i18n/common';
import {
  indexPatternsText,
  fieldLevelSecurityDisabledText,
  documentLevelSecurityDisabledText
} from '../../../../utils/i18n/roles';
import { actionGroupsText, singlePermissionsText } from '../../../../utils/i18n/action_groups';
import {
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  FormikSwitch,
  Icon
} from '../../../../components';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';
import {
  validIndicesSinglePermissionOption
} from '../../../../utils/validation';
import FieldLevelSecurity from './FieldLevelSecurity';
import DocumentLevelSecurity from './DocumentLevelSecurity';

const indexPatternNames = (indexPatterns = []) => comboBoxOptionsToArray(indexPatterns).join(', ');

const IndexPatterns = ({
  httpClient,
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
  onComboBoxCreateOption,
  onTriggerConfirmDeletionModal,
  onTriggerErrorCallout
}) => (
  indexPermissions.map((indexPermission, index) => (
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
                onTriggerConfirmDeletionModal({
                  body: indexPatternNames(indexPermission.index_patterns),
                  onConfirm: () => {
                    arrayHelpers.remove(index);
                    onTriggerConfirmDeletionModal(null);
                  }
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
              onChange: onComboBoxChange(),
              onCreateOption: onComboBoxCreateOption()
            }}
          />
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
              onChange: onComboBoxChange()
            }}
          />
          <FormikSwitch
            formRow
            elementProps={{
              label: advancedText,
              checked: indexPermissions[index]._isAdvanced
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
                onCreateOption: onComboBoxCreateOption(validIndicesSinglePermissionOption),
                onChange: onComboBoxChange()
              }}
            />
          }
          {!isFlsEnabled ? (
            <Fragment>
              <EuiSpacer />
              <EuiCallOut
                data-test-subj="sgFLSDisabledCallout"
                className="sgFixedFormItem"
                iconType="iInCircle"
                title={fieldLevelSecurityDisabledText}
              />
            </Fragment>
          ) : (
            <Fragment>
              <FieldLevelSecurity
                httpClient={httpClient}
                index={index}
                isAnonymizedFieldsEnabled={isAnonymizedFieldsEnabled}
                onComboBoxChange={onComboBoxChange}
                onComboBoxOnBlur={onComboBoxOnBlur}
                onComboBoxCreateOption={onComboBoxCreateOption}
                onTriggerErrorCallout={onTriggerErrorCallout}
              />
            </Fragment>
          )}
          {!isDlsEnabled
            ? (
              <Fragment>
                <EuiSpacer />
                <EuiCallOut
                  data-test-subj="sgDLSDisabledCallout"
                  className="sgFixedFormItem"
                  iconType="iInCircle"
                  title={documentLevelSecurityDisabledText}
                />
              </Fragment>
            )
            : <DocumentLevelSecurity httpClient={httpClient} index={index} />
          }
          <EuiSpacer />
        </EuiAccordion>
      </EuiFlexItem>
    </EuiFlexGroup>
  ))
);

IndexPatterns.propTypes = {
  httpClient: PropTypes.func.isRequired,
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
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default IndexPatterns;
