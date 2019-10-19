import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import {
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiAccordion, EuiErrorBoundary
} from '@elastic/eui';
import {
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  Icon
} from '../../../../components';

import {tenantPatternsPermissionText, tenantPatternsText} from '../../../../utils/i18n/roles';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';
import { GLOBAL_TENANT } from '../../utils/constants';

const tenantPatternNames = (options = []) => comboBoxOptionsToArray(options).join(', ');

import { TenantRBAC } from "./TenantRBAC";
import FormikInputWrapper from "../../../../components/FormControls/FormikInputWrapper";
import FormikFormRow from "../../../../components/FormControls/FormikFormRow";





const TenantPatterns = ({
  allTenants,
  isMultiTenancyEnabled,
  tenantPermissions,
  originalActionGroups,
  allAppActionGroups,
  arrayHelpers,
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption,
  onTriggerConfirmDeletionModal,
  form,
  values
}) => (
  tenantPermissions.map((tenantPermission, index) => {
    console.log({form, values})
    const hideTenantPattern = !isMultiTenancyEnabled
      && isEmpty(tenantPermission.tenant_patterns.filter(({ label }) => label === GLOBAL_TENANT));

    if (!hideTenantPattern) {
      return (
        <EuiFlexGroup key={index}>
          <EuiFlexItem>
            <EuiAccordion
              data-test-subj={`sgRoleTenantPatternsAccordion-${index}`}
              id={index.toString(2)}
              className="euiAccordionForm"
              buttonClassName="euiAccordionForm__button"
              extraAction={
                <AccordionDeleteButton
                  onClick={() => {
                    onTriggerConfirmDeletionModal({
                      body: tenantPatternNames(tenantPermission.tenant_patterns),
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
                  iconType={<Icon size="xl" type="tenantPattern" />}
                  titleText={tenantPatternsText}
                  subduedText={tenantPatternNames(tenantPermission.tenant_patterns)}
                />
              }
            >
              <FormikComboBox
                name={`_tenantPermissions[${index}].tenant_patterns`}
                formRow
                rowProps={{
                  label: tenantPatternsText,
                }}
                elementProps={{
                  isClearable: true,
                  options: isMultiTenancyEnabled ? allTenants : [{ label: GLOBAL_TENANT }],
                  onBlur: onComboBoxOnBlur,
                  onChange: onComboBoxChange(),
                  onCreateOption: (label, field, form) => {
                    if (isMultiTenancyEnabled) {
                      onComboBoxCreateOption()(label, field, form);
                    }
                  }
                }}
              />

              <EuiErrorBoundary>
                <FormikInputWrapper
                  name={`_tenantPermissions[${index}].allowed_actions`}
                  formikFieldProps={{}}
                  render={({ field, form }) => {
                    const RBAC = (<TenantRBAC actionGroups={originalActionGroups}
                      roleActionGroups={field.value}
                      onPermissionsChange={(values) => {form.setFieldValue(field.name, values);}} />)

                    return <FormikFormRow
                      name={`_tenantPermissions[${index}].allowed_actions`}
                      form={form}
                      rowProps={{
                        label: tenantPatternsPermissionText,
                        fullWidth: true
                      }}>
                      {RBAC}
                    </FormikFormRow>

                  }}
                />
              </EuiErrorBoundary>
              <EuiSpacer size="xl" />
            </EuiAccordion>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }
  })
);

TenantPatterns.propTypes = {
  allTenants: PropTypes.array.isRequired,
  isMultiTenancyEnabled: PropTypes.bool.isRequired,
  tenantPermissions: PropTypes.array.isRequired,
  arrayHelpers: PropTypes.object.isRequired,
  originalActionGroups: PropTypes.object.isRequired,
  allAppActionGroups: PropTypes.array.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default TenantPatterns;
