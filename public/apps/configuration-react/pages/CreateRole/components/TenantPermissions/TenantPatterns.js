import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiAccordion
} from '@elastic/eui';
import {
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox
} from '../../../../components';
import { actionGroupsText } from '../../../../utils/i18n/action_groups';
import { tenantPatternsText } from '../../../../utils/i18n/roles';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';

const tenantPatternNames = (options = []) => comboBoxOptionsToArray(options).join(', ');

const TenantPatterns = ({ tenantPermissions, allAppActionGroups, arrayHelpers }) => (
  tenantPermissions.map((tenantPermission, index) => (
    <EuiFlexGroup key={index}>
      <EuiFlexItem>
        <EuiAccordion
          id={index.toString(2)}
          className="euiAccordionForm"
          buttonClassName="euiAccordionForm__button"
          extraAction={<AccordionDeleteButton onClick={() => { arrayHelpers.remove(index); }}/>}
          buttonContent={
            <AccordionButtonContent
              iconType="usersRolesApp"
              titleText={tenantPatternsText}
              subduedText={tenantPatternNames(tenantPermission.tenant_patterns)}
            />
          }
        >
          <EuiSpacer />

          <EuiFlexGroup>
            <EuiFlexItem>
              <FormikComboBox
                name={`_tenantPermissions[${index}].tenant_patterns`}
                formRow
                rowProps={{
                  label: tenantPatternsText,
                }}
                elementProps={{
                  isClearable: true,
                  onBlur: (e, field, form) => {
                    form.setFieldTouched(`_tenantPermissions[${index}].tenant_patterns`, true);
                  },
                  onChange: (options, field, form) => {
                    form.setFieldValue(`_tenantPermissions[${index}].tenant_patterns`, options);
                  },
                  onCreateOption: (label, field, form) => {
                    const normalizedSearchValue = label.trim().toLowerCase();
                    if (!normalizedSearchValue) return;
                    form.setFieldValue(`_tenantPermissions[${index}].tenant_patterns`, field.value.concat({ label }));
                  }
                }}
              />
            </EuiFlexItem>

            <EuiFlexItem>
              <FormikComboBox
                name={`_tenantPermissions[${index}].allowed_actions`}
                formRow
                rowProps={{
                  label: actionGroupsText,
                }}
                elementProps={{
                  options: allAppActionGroups,
                  isClearable: true,
                  onBlur: (e, field, form) => {
                    form.setFieldTouched(`_tenantPermissions[${index}].allowed_actions`, true);
                  },
                  onChange: (options, field, form) => {
                    form.setFieldValue(`_tenantPermissions[${index}].allowed_actions`, options);
                  }
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xl" />

        </EuiAccordion>
      </EuiFlexItem>
    </EuiFlexGroup>
  ))
);

TenantPatterns.propTypes = {
  tenantPermissions: PropTypes.array.isRequired,
  arrayHelpers: PropTypes.object.isRequired,
  allAppActionGroups: PropTypes.array.isRequired
};

export default TenantPatterns;
