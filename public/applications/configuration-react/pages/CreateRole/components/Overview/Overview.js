/* eslint-disable @kbn/eslint/require-license-header */
import React, { Fragment } from 'react';
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

const Overview = ({
  values,
  titleText,
  onTriggerInspectJsonFlyout,
  isUpdatingName,
  httpClient,
}) => {
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
          onTriggerInspectJsonFlyout({
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
  httpClient: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  isUpdatingName: PropTypes.bool.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
};

export default Overview;
