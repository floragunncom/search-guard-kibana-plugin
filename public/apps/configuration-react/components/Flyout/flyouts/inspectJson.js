import React from 'react';
import { EuiCodeEditor, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { i18nJsonText } from '../../../utils/i18n_nodes';
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
      <EuiText>{i18nJsonText}</EuiText>
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
