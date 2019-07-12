import React from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiLoadingKibana
} from '@elastic/eui';

const LoadingPage = (
  <EuiFlexGroup justifyContent="spaceAround">
    <EuiFlexItem grow={false}>
      <EuiLoadingKibana size="xl" />
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default LoadingPage;
