import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
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
import { GLOBAL_TENANT } from '../../utils/constants';

const tenantPatternNames = (options = []) => comboBoxOptionsToArray(options).join(', ');

const TenantPatterns = ({
  allTenants,
  isMultiTenancyEnabled,
  tenantPermissions,
  allAppActionGroups,
  arrayHelpers,
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => (
  tenantPermissions.map((tenantPermission, index) => {
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
                      options: isMultiTenancyEnabled ? allTenants : [{ label: GLOBAL_TENANT }],
                      onBlur: onComboBoxOnBlur,
                      onChange: onComboBoxChange,
                      onCreateOption: (label, field, form) => {
                        if (isMultiTenancyEnabled) {
                          onComboBoxCreateOption(label, field, form);
                        }
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
                      onBlur: onComboBoxOnBlur,
                      onChange: onComboBoxChange
                    }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
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
  allAppActionGroups: PropTypes.array.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

export default TenantPatterns;
