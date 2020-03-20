/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonEmpty, EuiToolTip } from '@elastic/eui';
import { AccessControlService } from '../../../services';
import { logoutText, logoutUserText } from '../utils/i18n';

export function LogOutButton({
  httpClient,
  authType,
  logoutUrl,
  logoutButtonText,
  logoutTooltipText,
}) {
  const acService = new AccessControlService({ httpClient, authType });

  function logout() {
    acService.logout({ logoutUrl });
  }

  return (
    <EuiToolTip position="bottom" content={logoutTooltipText}>
      <EuiButtonEmpty
        id="btn-logout"
        style={{ paddingTop: '8px' }}
        onClick={logout}
        iconType="exit"
      >
        {logoutButtonText}
      </EuiButtonEmpty>
    </EuiToolTip>
  );
}

LogOutButton.defaultProps = {
  logoutButtonText: logoutText,
  logoutTooltipText: logoutUserText,
};

LogOutButton.propTypes = {
  httpClient: PropTypes.object.isRequired,
  authType: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string,
  logoutButtonText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  logoutTooltipText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};
