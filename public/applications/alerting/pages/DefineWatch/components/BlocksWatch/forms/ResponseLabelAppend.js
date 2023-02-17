/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import { EuiLink, EuiText } from '@elastic/eui';
import { closeText } from '../../../../../utils/i18n/watch';

export function ResponseLabelAppend({ onClick }) {
  return (
    <EuiText size="xs">
      <EuiLink onClick={onClick}>{closeText} X</EuiLink>
    </EuiText>
  );
}
