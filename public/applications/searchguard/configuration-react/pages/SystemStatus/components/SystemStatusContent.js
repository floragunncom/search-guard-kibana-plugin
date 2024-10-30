/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { map, toString } from 'lodash';
import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiText,
  EuiSpacer
} from '@elastic/eui';
import { SIDE_NAV } from '../utils/constants';
import * as systemStatusI18nLabels from '../../../utils/i18n/system_status';

const SystemStatusContent = ({ resource, sideNavItemName }) => {
  return (
    <Fragment>
      <EuiFlexGrid columns={2} className="sgFixedFormGroupItem">
        {map(resource, (value, key) => {
          return (
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
                  <EuiText data-test-subj={`sgSystemStatusContentValue-${key}`}>{toString(value)}</EuiText>
                )}
              </EuiFlexItem>
            </Fragment>
          )
        })}
      </EuiFlexGrid>

    </Fragment>
  );
};

SystemStatusContent.propTypes = {
  selectSideNavItem: PropTypes.oneOf([SIDE_NAV.CLUSTER, SIDE_NAV.LICENSE, SIDE_NAV.LICENSE]),
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
      version: PropTypes.string
    }),
    RESTManagementAPI: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string
    }),
    auditLogging: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string
    }),
    documentAndFieldLevelSecurity: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string
    }),
    internalUsersAuthenticationBackend: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string
    }),
    kibanaMultitenancy: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string
    }),
    kibanaPlugin: PropTypes.shape({
      is_enterprise: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      version: PropTypes.string
    })
  })
};

export default SystemStatusContent;
