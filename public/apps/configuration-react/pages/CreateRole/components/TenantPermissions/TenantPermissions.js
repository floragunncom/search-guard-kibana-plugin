import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiSpacer,
  EuiTitle,
  EuiButton,
  EuiCallOut
} from '@elastic/eui';
import { EmptyPrompt } from '../../../../components';
import { addText } from '../../../../utils/i18n/common';
import {
  emptyTenantPermissionsText,
  tenantPermissionsText,
  multiTenancyDisabledText,
  globalAppPermissionsDisabledText
} from '../../../../utils/i18n/roles';
import { TENANT_PERMISSION } from '../../utils/constants';
import { tenantPermissionToUiTenantPermission } from '../../utils';
import TenantPatterns from './TenantPatterns';
import GlobalAppPermissions from './GlobalAppPermissions';

const addTenantPermission = arrayHelpers => {
  arrayHelpers.push(tenantPermissionToUiTenantPermission(TENANT_PERMISSION));
};

const TenantPermissions = ({
  allAppActionGroups,
  tenantPermissions,
  isMultiTenancyEnabled,
  isGlobalAppPermissionsEnabled
}) => (
  <Fragment>
    {!isGlobalAppPermissionsEnabled ? (
      <EuiCallOut className="sgFixedFormItem" iconType="iInCircle" title={globalAppPermissionsDisabledText} />
    ) : (
      <GlobalAppPermissions allAppActionGroups={allAppActionGroups} />
    )}
    <EuiSpacer />

    {!isMultiTenancyEnabled ? (
      <EuiCallOut className="sgFixedFormItem" iconType="iInCircle" title={multiTenancyDisabledText} />
    ) : (
      <Fragment>
        <EuiTitle size="xs"><h4>{tenantPermissionsText}</h4></EuiTitle>
        <EuiSpacer size="s" />

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
                <TenantPatterns
                  tenantPermissions={tenantPermissions}
                  allAppActionGroups={allAppActionGroups}
                  arrayHelpers={arrayHelpers}
                />
              )}
            </Fragment>
          )}
        />
      </Fragment>
    )}
    <EuiSpacer />
  </Fragment>
);

TenantPermissions.propTypes = {
  isMultiTenancyEnabled: PropTypes.bool.isRequired,
  isGlobalAppPermissionsEnabled: PropTypes.bool.isRequired,
  tenantPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      tenant_patterns: PropTypes.array.isRequired,
      allowed_actions: PropTypes.array.isRequired
    })
  ).isRequired,
  allAppActionGroups: PropTypes.array.isRequired
};

export default TenantPermissions;
