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

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { EuiSpacer, EuiFlexItem, EuiFlexGroup, EuiAccordion } from '@elastic/eui';
import {
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  Icon,
} from '../../../../components';
import { actionGroupsText } from '../../../../utils/i18n/action_groups';
import { tenantPatternsText } from '../../../../utils/i18n/roles';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';
import { GLOBAL_TENANT } from '../../utils/constants';

import { Context } from '../../../../Context';

const tenantPatternNames = (options = []) => comboBoxOptionsToArray(options).join(', ');

const TenantPatterns = ({
  allTenants,
  isMultiTenancyEnabled,
  tenantPermissions,
  allAppActionGroups,
  arrayHelpers,
}) => {
  const {
    onComboBoxChange,
    onComboBoxCreateOption,
    onComboBoxOnBlur,
    triggerConfirmDeletionModal,
  } = useContext(Context);

  return tenantPermissions.map((tenantPermission, index) => {
    const hideTenantPattern =
      !isMultiTenancyEnabled &&
      isEmpty(tenantPermission.tenant_patterns.filter(({ label }) => label === GLOBAL_TENANT));

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
                    triggerConfirmDeletionModal({
                      body: tenantPatternNames(tenantPermission.tenant_patterns),
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
                  },
                }}
              />
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
                  onChange: onComboBoxChange(),
                }}
              />
              <EuiSpacer size="xl" />
            </EuiAccordion>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }
  });
};

TenantPatterns.propTypes = {
  allTenants: PropTypes.array.isRequired,
  isMultiTenancyEnabled: PropTypes.bool.isRequired,
  tenantPermissions: PropTypes.array.isRequired,
  arrayHelpers: PropTypes.object.isRequired,
  allAppActionGroups: PropTypes.array.isRequired,
};

export default TenantPatterns;
