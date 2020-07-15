/* eslint-disable @kbn/eslint/require-license-header */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { isEmpty } from 'lodash';
import { EuiSpacer, EuiCallOut } from '@elastic/eui';
import { EmptyPrompt, AddButton } from '../../../../components';
import { addText } from '../../../../utils/i18n/common';
import {
  emptyTenantPermissionsText,
  tenantPermissionsText,
  multiTenancyDisabledText,
} from '../../../../utils/i18n/roles';
import { TENANT_PERMISSION, GLOBAL_TENANT } from '../../utils/constants';
import { tenantPermissionToUiTenantPermission } from '../../utils';
import TenantPatterns from './TenantPatterns';

const addTenantPermission = (arrayHelpers, isMultiTenancyEnabled) => {
  const permission = tenantPermissionToUiTenantPermission(TENANT_PERMISSION);
  if (!isMultiTenancyEnabled) {
    permission.tenant_patterns.push({ label: GLOBAL_TENANT });
  }
  arrayHelpers.push(permission);
};

const TenantPermissions = ({
  allTenants,
  allAppActionGroups,
  tenantPermissions,
  isMultiTenancyEnabled,
}) => {
  return (
    <Fragment>
      {!isMultiTenancyEnabled && (
        <Fragment>
          <EuiCallOut
            data-test-subj="sgMultiTenancyDisabled"
            className="sgFixedFormItem"
            iconType="iInCircle"
            title={multiTenancyDisabledText}
          />
          <EuiSpacer />
        </Fragment>
      )}
      <FieldArray
        name="_tenantPermissions"
        render={arrayHelpers => (
          <Fragment>
            <AddButton onClick={() => addTenantPermission(arrayHelpers, isMultiTenancyEnabled)} />
            <EuiSpacer />

            {isEmpty(tenantPermissions) ? (
              <EmptyPrompt
                titleText={tenantPermissionsText}
                bodyText={emptyTenantPermissionsText}
                createButtonText={addText}
                onCreate={() => {
                  addTenantPermission(arrayHelpers);
                }}
              />
            ) : (
              <TenantPatterns
                isMultiTenancyEnabled={isMultiTenancyEnabled}
                allTenants={allTenants}
                tenantPermissions={tenantPermissions}
                allAppActionGroups={allAppActionGroups}
                arrayHelpers={arrayHelpers}
              />
            )}
          </Fragment>
        )}
      />
      <EuiSpacer />
    </Fragment>
  );
};

TenantPermissions.propTypes = {
  allTenants: PropTypes.array.isRequired,
  isMultiTenancyEnabled: PropTypes.bool.isRequired,
  tenantPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      tenant_patterns: PropTypes.array.isRequired,
      allowed_actions: PropTypes.array.isRequired,
    })
  ).isRequired,
  allAppActionGroups: PropTypes.array.isRequired,
};

export default TenantPermissions;
