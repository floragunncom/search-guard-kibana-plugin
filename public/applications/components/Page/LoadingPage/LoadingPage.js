import React from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiLoadingLogo
} from '@elastic/eui';

const LoadingPage = (
  <EuiFlexGroup justifyContent="spaceAround">
    <EuiFlexItem grow={false}>
      <EuiLoadingLogo size="xl" />
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default LoadingPage;
