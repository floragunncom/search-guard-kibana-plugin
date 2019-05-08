import React from 'react';
import { EuiCodeEditor, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { jsonText } from '../../../utils/i18n/common';
import { stringifyPretty } from '../../../utils/helpers';

const inspectJson = ({ title, json }) => ({
  flyoutProps: {
    size: 'm'
  },
  headerProps: { hasBorder: true },
  header: (
    <EuiTitle size="m">
      <h2>{title}</h2>
    </EuiTitle>
  ),
  body: (
    <div>
      <EuiText>{jsonText}</EuiText>
      <EuiSpacer />

      <EuiCodeEditor
        mode="json"
        theme="github"
        height="600px"
        width="100%"
        readOnly
        value={stringifyPretty(json)}
        setOptions={{ fontSize: '12px' }}
      />
    </div>
  ),
});

export default inspectJson;
