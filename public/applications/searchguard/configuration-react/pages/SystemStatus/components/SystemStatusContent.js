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

/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { map, toString } from 'lodash';
import { EuiFlexGrid, EuiFlexItem, EuiText, EuiSpacer } from '@elastic/eui';
import { SIDE_NAV } from '../utils/constants';
import * as systemStatusI18nLabels from '../../../utils/i18n/system_status';

const SystemStatusContent = ({ resource, sideNavItemName }) => {
  const isActiveModulesSection = sideNavItemName === SIDE_NAV.ACTIVE_MODULES;
  return (
    <Fragment>
      <EuiFlexGrid columns={2} className="sgFixedFormGroupItem">
        {map(resource, (value, key) => {
          return !isActiveModulesSection ? (
            <Fragment key={key}>
              <EuiFlexItem>
                <EuiText data-test-subj={`sgSystemStatusContentKey-${key}`}>
                  {systemStatusI18nLabels[key]}
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                {React.isValidElement(value) ? (
                  <div data-test-subj={`sgSystemStatusContentValue-${key}`}>{value}</div>
                ) : (
                  <EuiText data-test-subj={`sgSystemStatusContentValue-${key}`}>
                    {toString(value)}
                  </EuiText>
                )}
              </EuiFlexItem>
            </Fragment>
          ) : (
            <EuiSpacer key={key} size="m" />
          );
        })}
      </EuiFlexGrid>

      {isActiveModulesSection && (
        <Fragment>
          <EuiFlexGrid columns={3} className="sgFixedFormGroupItem">
            <EuiFlexItem>
              <EuiText>
                <h3>{systemStatusI18nLabels.name}</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText>
                <h3>{systemStatusI18nLabels.version}</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText>
                <h3>{systemStatusI18nLabels.isEnterprise}</h3>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="m" />
        </Fragment>
      )}

      <EuiFlexGrid columns={3} className="sgFixedFormGroupItem">
        {map(resource, (value, key) => {
          return (
            isActiveModulesSection && (
              <Fragment key={key}>
                <EuiFlexItem>
                  <EuiText data-test-subj={`sgSystemStatusContentActiveModulesName-${key}`}>
                    {systemStatusI18nLabels[key]}
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText data-test-subj={`sgSystemStatusContentActiveModulesVersion-${key}`}>
                    {value.version}
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText data-test-subj={`sgSystemStatusContentActiveModulesIsEnterprise-${key}`}>
                    {toString(value.is_enterprise)}
                  </EuiText>
                </EuiFlexItem>
              </Fragment>
            )
          );
        })}
      </EuiFlexGrid>
    </Fragment>
  );
};

SystemStatusContent.propTypes = {
  selectSideNavItem: PropTypes.oneOf([SIDE_NAV.CLUSTER, SIDE_NAV.LICENSE, SIDE_NAV.ACTIVE_MODULES]),
  resource: PropTypes.shape({
    clusterName: PropTypes.string,
    nodes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    daysLeft: PropTypes.number,
    endDate: PropTypes.string,
    isExpired: PropTypes.bool,
    isValid: PropTypes.bool,
    issuedTo: PropTypes.string,
    startDate: PropTypes.string,
    type: PropTypes.string,
    HTTPBasicAuthenticator: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string,
    }),
    RESTManagementAPI: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string,
    }),
    auditLogging: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string,
    }),
    documentAndFieldLevelSecurity: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string,
    }),
    internalUsersAuthenticationBackend: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string,
    }),
    kibanaMultitenancy: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string,
    }),
    kibanaPlugin: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string,
    }),
  }),
};

export default SystemStatusContent;
