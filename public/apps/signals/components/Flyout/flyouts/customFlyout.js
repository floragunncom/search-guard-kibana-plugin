import React from 'react';
import { EuiTitle } from '@elastic/eui';

const customFlyout = ({
  title,
  body,
  flyoutProps = { size: 'm' },
  headerProps = { hasBorder: true }
} = {}) => ({
  flyoutProps,
  headerProps,
  header: (
    <EuiTitle size="m">
      <h2>{title}</h2>
    </EuiTitle>
  ),
  body,
});

export default customFlyout;
