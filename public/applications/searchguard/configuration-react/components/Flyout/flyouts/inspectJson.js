/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { EuiCodeEditor, EuiText, EuiTitle } from '@elastic/eui';
import { jsonText } from '../../../utils/i18n/common';
import { stringifyPretty } from '../../../utils/helpers';
import {CodeEditor} from "../../../../../components";

const inspectJson = ({ title, json, editorTheme }) => ({
  flyoutProps: {
    size: 'm',
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
      <CodeEditor
        mode="json"
        theme={editorTheme}
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
