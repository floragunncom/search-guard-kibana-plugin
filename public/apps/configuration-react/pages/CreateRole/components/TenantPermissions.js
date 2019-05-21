import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiSpacer,
  EuiTitle,
  EuiButton,
  EuiFlexItem,
  EuiFlexGroup,
  EuiAccordion
} from '@elastic/eui';
import {
  AccordionButtonContent,
  AccordionDeleteButton,
  FormikComboBox,
  EmptyPrompt
} from '../../../components';
import {
  addText
} from '../../../utils/i18n/common';
import {
  actionGroupsText
} from '../../../utils/i18n/action_groups';
import {
  globalAppPermissionsText,
  tenantPatternsText,
  emptyTenantPermissionsText,
  tenantPermissionsText
} from '../../../utils/i18n/roles';
import { TENANT_PERMISSION } from '../utils/constants';
import { tenantPermissionToUiTenantPermission } from '../utils';
import { comboBoxOptionsToArray } from '../../../utils/helpers';

const GlobalAppPermissions = ({ allAppActionGroups }) => (
  <Fragment>
    <EuiTitle size="xs"><h4>{globalAppPermissionsText}</h4></EuiTitle>
    <EuiSpacer size="s" />

    <FormikComboBox
      name="_globalApplicationPermissions"
      formRow
      rowProps={{
        label: actionGroupsText,
      }}
      elementProps={{
        options: allAppActionGroups,
        isClearable: true,
        onBlur: (e, field, form) => {
          form.setFieldTouched('_globalApplicationPermissions', true);
        },
        onChange: (options, field, form) => {
          form.setFieldValue('_globalApplicationPermissions', options);
        }
      }}
    />
  </Fragment>
);

const tenantPatternNames = (options = []) => comboBoxOptionsToArray(options).join(', ');
const TenantPermissionsAccordion = ({ tenantPermissions, allAppActionGroups, arrayHelpers }) => (
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

const addTenantPermission = arrayHelpers => {
  arrayHelpers.push(tenantPermissionToUiTenantPermission(TENANT_PERMISSION));
};

const TenantPermissions = ({ allAppActionGroups, tenantPermissions }) => (
  <Fragment>
    <GlobalAppPermissions allAppActionGroups={allAppActionGroups} />
    <FieldArray
      name="_tenantPermissions"
      render={arrayHelpers => (
        <Fragment>
          <EuiButton
            onClick={() => { addTenantPermission(arrayHelpers); }}
            size="s"
            iconType="plusInCircle"
          >
            {addText}
          </EuiButton>
          <EuiSpacer />

          {isEmpty(tenantPermissions) ? (
            <EmptyPrompt
              titleText={tenantPermissionsText}
              bodyText={emptyTenantPermissionsText}
              createButtonText={addText}
              onCreate={() => { addTenantPermission(arrayHelpers); }}
            />
          ) : (
            <TenantPermissionsAccordion
              tenantPermissions={tenantPermissions}
              allAppActionGroups={allAppActionGroups}
              arrayHelpers={arrayHelpers}
            />
          )}
        </Fragment>
      )}
    />
  </Fragment>
);

TenantPermissions.propTypes = {
  tenantPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      tenant_patterns: PropTypes.array.isRequired,
      allowed_actions: PropTypes.array.isRequired
    })
  ).isRequired,
  allAppActionGroups: PropTypes.array.isRequired
};

export default TenantPermissions;
