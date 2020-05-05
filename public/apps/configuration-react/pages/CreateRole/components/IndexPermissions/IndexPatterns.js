/* eslint-disable @kbn/eslint/require-license-header */
import React, { Fragment, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiCallOut,
  EuiHealth,
  EuiHighlight,
} from '@elastic/eui';
import { advancedText } from '../../../../utils/i18n/common';
import {
  indexPatternsText,
  fieldLevelSecurityDisabledText,
  documentLevelSecurityDisabledText,
} from '../../../../utils/i18n/roles';
import { actionGroupsText, singlePermissionsText } from '../../../../utils/i18n/action_groups';
import {
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  FormikSwitch,
  Icon,
} from '../../../../components';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';
import { validIndicesSinglePermissionOption } from '../../../../utils/validation';
import FieldLevelSecurity from './FieldLevelSecurity';
import DocumentLevelSecurity from './DocumentLevelSecurity';
import { ElasticsearchService } from '../../../../services';
import { indicesToUiIndices } from '../../utils/role_to_formik';

import { Context } from '../../../../Context';

const indexPatternNames = (indexPatterns = []) => comboBoxOptionsToArray(indexPatterns).join(', ');

const IndexPatterns = ({
  indexPermissions,
  arrayHelpers,
  allActionGroups,
  allSinglePermissions,
  isDlsEnabled,
  isFlsEnabled,
  isAnonymizedFieldsEnabled,
  onTriggerErrorCallout,
}) => {
  const {
    httpClient,
    onSwitchChange,
    onComboBoxChange,
    onComboBoxOnBlur,
    onComboBoxCreateOption,
    triggerConfirmDeletionModal,
  } = useContext(Context);

  const [isLoading, setIsLoading] = useState(false);
  const [indexOptions, setIndexOptions] = useState([]);

  const esService = new ElasticsearchService(httpClient);

  async function onSearchChange(query = '') {
    setIsLoading(true);

    try {
      if (!query.endsWith('*')) query += '*';

      query = query.trim();
      if (query === '*:' || query === '') return [];

      const [{ data: indices = [] }, { data: aliases = [] }] = await Promise.all([
        esService.getIndices(query),
        esService.getAliases(query),
      ]);

      setIndexOptions(indicesToUiIndices([...indices, ...aliases]));
    } catch (error) {
      console.error('IndexPatterns - onSearchChange', error);
      onTriggerErrorCallout(error);
    }

    setIsLoading(false);
  }

  function renderIndexOption({ color, label }, searchValue, contentClassName) {
    return (
      <EuiHealth color={color}>
        <span className={contentClassName}>
          <EuiHighlight search={searchValue}>{label}</EuiHighlight>
        </span>
      </EuiHealth>
    );
  }

  useEffect(() => {
    onSearchChange('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return indexPermissions.map((indexPermission, index) => (
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
          <FormikComboBox
            name={`_indexPermissions[${index}].index_patterns`}
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
            name={`_indexPermissions[${index}].allowed_actions.actiongroups`}
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
            name={`_indexPermissions[${index}]._isAdvanced`}
          />
          {indexPermissions[index]._isAdvanced && (
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
                onChange: onComboBoxChange(),
              }}
            />
          )}
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
              <EuiSpacer />
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
          {!isDlsEnabled ? (
            <Fragment>
              <EuiSpacer />
              <EuiCallOut
                data-test-subj="sgDLSDisabledCallout"
                className="sgFixedFormItem"
                iconType="iInCircle"
                title={documentLevelSecurityDisabledText}
              />
            </Fragment>
          ) : (
            <>
              <EuiSpacer />
              <DocumentLevelSecurity httpClient={httpClient} index={index} />
            </>
          )}
          <EuiSpacer />
        </EuiAccordion>
      </EuiFlexItem>
    </EuiFlexGroup>
  ));
};

IndexPatterns.propTypes = {
  indexPermissions: PropTypes.array.isRequired,
  arrayHelpers: PropTypes.object.isRequired,
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
  isDlsEnabled: PropTypes.bool.isRequired,
  isFlsEnabled: PropTypes.bool.isRequired,
  isAnonymizedFieldsEnabled: PropTypes.bool.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
};

export default IndexPatterns;
