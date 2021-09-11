/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import { isEmpty, pick } from 'lodash';

const getResource = (selectSideNavItem, resources) => {
  if (isEmpty(resources)) return {};
  switch (selectSideNavItem) {
    case 'cluster':
      return {
        clusterName: resources.cluster_name,
        nodes: resources._nodes.total,
      };
    case 'license':
      return {
        type: resources.sg_license.type,
        nodes: resources.sg_license.allowed_node_count_per_cluster,
        issuedTo: resources.sg_license.issued_to,
        UUID: (<span>{resources.sg_license.uid}</span>),
        startDate: resources.sg_license.start_date,
        endDate: resources.sg_license.expiry_date,
        daysLeft: resources.sg_license.expiry_in_days,
        isValid: resources.sg_license.is_valid,
        isExpired: resources.sg_license.is_expired
      };
    default:
      return {
        kibanaPlugin: {
          version: resources.sg_version,
          is_enterprise: false
        },
        auditLogging: pick(resources.modules.AUDITLOG, ['version', 'is_enterprise']),
        documentAndFieldLevelSecurity: pick(resources.modules.DLSFLS, ['version', 'is_enterprise']),
        HTTPBasicAuthenticator: pick(resources.modules.HTTP_BASIC_AUTHENTICATOR, ['version', 'is_enterprise']),
        internalUsersAuthenticationBackend: pick(resources.modules.INTERNAL_USERS_AUTHENTICATION_BACKEND, ['version', 'is_enterprise']),
        kibanaMultitenancy: pick(resources.modules.MULTITENANCY, ['version', 'is_enterprise']),
        RESTManagementAPI: pick(resources.modules.REST_MANAGEMENT_API, ['version', 'is_enterprise']),
      };
  }
};

export default getResource;
