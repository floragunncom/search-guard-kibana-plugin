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

import React, { Fragment, useContext } from 'react';
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

import { Context } from '../../../../Context';

const addTenantPermission = (arrayHelpers, isMultiTenancyEnabled) => {
  const permission = tenantPermissionToUiTenantPermission(TENANT_PERMISSION);
  if (!isMultiTenancyEnabled) {
    permission.tenant_patterns.push({ label: GLOBAL_TENANT });
  }
  arrayHelpers.push(permission);
};

const TenantPermissions = ({ values, allTenants, allAppActionGroups, history }) => {
  const { configService } = useContext(Context);
  const isMultiTenancyEnabled = configService.multiTenancyEnabled();

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
      <FieldArray name="_tenantPermissions">
        {(arrayHelpers) => (
          <Fragment>
            <AddButton onClick={() => addTenantPermission(arrayHelpers, isMultiTenancyEnabled)} />
            <EuiSpacer />

            {isEmpty(values._tenantPermissions) ? (
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
                history={history}
                isMultiTenancyEnabled={isMultiTenancyEnabled}
                allTenants={allTenants}
                tenantPermissions={values._tenantPermissions}
                allAppActionGroups={allAppActionGroups}
                arrayHelpers={arrayHelpers}
              />
            )}
          </Fragment>
        )}
      </FieldArray>
      <EuiSpacer />
    </Fragment>
  );
};

TenantPermissions.propTypes = {
  values: PropTypes.shape({
    _tenantPermissions: PropTypes.arrayOf(
      PropTypes.shape({
        tenant_patterns: PropTypes.array.isRequired,
        allowed_actions: PropTypes.array.isRequired,
      })
    ).isRequired,
  }).isRequired,
  allTenants: PropTypes.array.isRequired,
  allAppActionGroups: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};

export default TenantPermissions;
