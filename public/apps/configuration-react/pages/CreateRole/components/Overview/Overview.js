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
  EuiTitle
} from '@elastic/eui';
import {
  inspectText,
  nameText
} from '../../../../utils/i18n/common';
import {
  membersText,
  rolesText,
  usersText,
  hostsText,
  noMappedUsersFoundText,
  noMappedBackendRolesFoundText,
  noMappedHostsFoundText
} from '../../../../utils/i18n/roles';
import { formikToRole } from '../../utils';
import { FormikFieldText } from '../../../../components';
import { hasError, isInvalid, validateName } from '../../../../utils/validation';

const Overview = ({ values, titleText, onTriggerInspectJsonFlyout, rolesService, isUpdatingName }) => {
  const sectionNoMappedText = {
    users: noMappedUsersFoundText,
    backend_roles: noMappedBackendRolesFoundText,
    hosts: noMappedHostsFoundText
  };

  const sectionText = {
    users: usersText,
    backend_roles: rolesText,
    hosts: hostsText
  };

  return (
    <Fragment>
      <EuiButton
        size="s"
        iconType="inspect"
        onClick={() => {
          onTriggerInspectJsonFlyout({
            json: formikToRole(values),
            title: titleText
          });
        }}
      >
        {inspectText}
      </EuiButton>

      <EuiSpacer />

      <FormikFieldText
        formRow
        formikFieldProps={{
          validate: validateName(rolesService, isUpdatingName)
        }}
        rowProps={{
          label: nameText,
          isInvalid,
          error: hasError
        }}
        elementProps={{
          isInvalid
        }}
        name="_name"
      />

      <EuiTitle size="s"><h3>{membersText}</h3></EuiTitle>

      <EuiSpacer />

      {['users', 'backend_roles', 'hosts'].map((sectionName, i) => (
        <Fragment key={i}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiTitle size="xs"><h4>{sectionText[sectionName]}</h4></EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem className="sgFixedFormItem">
              {isEmpty(values._roleMapping[sectionName]) ? (
                <EuiCallOut iconType="iInCircle" title={sectionNoMappedText[sectionName]} />
              ) : (
                <EuiListGroup>
                  {map(values._roleMapping[sectionName], (item, i) => <EuiListGroupItem key={i} label={item} />)}
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
  rolesService: PropTypes.object.isRequired,
  isUpdatingName: PropTypes.bool.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired
};

export default Overview;
