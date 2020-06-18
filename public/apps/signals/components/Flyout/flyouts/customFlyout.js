/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { EuiTitle } from '@elastic/eui';

const customFlyout = ({
  title,
  body,
  flyoutProps = { size: 'm' },
  headerProps = { hasBorder: true },
  formikProps = {},
  onChange,
} = {}) => ({
  formikProps,
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
