/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { EuiLink, EuiText } from '@elastic/eui';

const sideNavItem = ({
  id,
  name,
  text,
  navData = {},
  isCategory = false,
  isActive = false,
  onClick,
}) => ({
  ...navData,
  id,
  name,
  renderItem: () => {
    if (isCategory) {
      return (
        <EuiText color="default">
          <h3>{text}</h3>
        </EuiText>
      );
    }

    return (
      <EuiLink data-test-subj={`sgSideNav-${id}`} onClick={onClick}>
        {isActive ? (
          <EuiText size="s" style={{ textDecoration: 'underline' }}>
            {text}
          </EuiText>
        ) : (
          <EuiText size="s" color="subdued">
            {text}
          </EuiText>
        )}
      </EuiLink>
    );
  },
});

export default sideNavItem;
