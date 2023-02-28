/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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
import { isEmpty, map } from 'lodash';
import {
  EuiButton,
  EuiCallOut,
  EuiFlexItem,
  EuiFlexGroup,
  EuiSpacer,
  EuiListGroup,
  EuiListGroupItem,
  EuiTitle,
} from '@elastic/eui';
import { inspectText, nameText } from '../../../../utils/i18n/common';
import {
  membersText,
  backendRolesText,
  usersText,
  hostsText,
  noMappedUsersFoundText,
  noMappedBackendRolesFoundText,
  noMappedHostsFoundText,
} from '../../../../utils/i18n/roles';
import { formikToRole } from '../../utils';
import { FormikFieldText, SubHeader } from '../../../../components';
import { hasError, isInvalid, validateName } from '../../../../utils/validation';
import { RolesService } from '../../../../services';

import { Context } from '../../../../Context';

const Overview = ({ values, titleText, isUpdatingName }) => {
  const { httpClient, triggerInspectJsonFlyout } = useContext(Context);
  const rolesService = new RolesService(httpClient);

  const sectionNoMappedText = {
    users: noMappedUsersFoundText,
    backend_roles: noMappedBackendRolesFoundText,
    hosts: noMappedHostsFoundText,
  };

  const sectionText = {
    users: usersText,
    backend_roles: backendRolesText,
    hosts: hostsText,
  };

  return (
    <Fragment>
      <EuiButton
        size="s"
        iconType="inspect"
        onClick={() => {
          triggerInspectJsonFlyout({
            json: formikToRole(values),
            title: titleText,
          });
        }}
      >
        {inspectText}
      </EuiButton>
      <EuiSpacer />

      <FormikFieldText
        formRow
        formikFieldProps={{
          validate: validateName(rolesService, isUpdatingName),
        }}
        rowProps={{
          label: nameText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
        }}
        name="_name"
      />

      <EuiSpacer />
      <SubHeader title={<h4>{membersText}</h4>} />
      {['users', 'backend_roles', 'hosts'].map((sectionName, i) => (
        <Fragment key={i}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiTitle size="xs">
                <h5>{sectionText[sectionName]}</h5>
              </EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem className="sgFixedFormItem">
              {isEmpty(values._roleMapping[sectionName]) ? (
                <EuiCallOut
                  data-test-subj={`sgRoleMembersNoMapCallout-${sectionName}`}
                  iconType="iInCircle"
                  title={sectionNoMappedText[sectionName]}
                />
              ) : (
                <EuiListGroup data-test-subj={`sgRoleMembers-${sectionName}`}>
                  {map(values._roleMapping[sectionName], (item, i) => (
                    <EuiListGroupItem key={i} label={item} />
                  ))}
                </EuiListGroup>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      ))}
    </Fragment>
  );
};

Overview.propTypes = {
  values: PropTypes.object.isRequired,
  isUpdatingName: PropTypes.bool.isRequired,
};

export default Overview;
