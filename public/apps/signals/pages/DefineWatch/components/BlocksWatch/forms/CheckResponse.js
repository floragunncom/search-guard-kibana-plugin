/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { EuiCodeEditor, EuiFormRow } from '@elastic/eui';
import { ResponseLabelAppend } from './ResponseLabelAppend';
import { responseText } from '../../../../../utils/i18n/watch';

export function CheckResponse({ index, editorOptions, editorTheme, checkBlock, onCloseResult }) {
  return (
    <EuiFormRow
      fullWidth
      label={responseText}
      labelAppend={<ResponseLabelAppend onClick={() => onCloseResult(index)} />}
    >
      <EuiCodeEditor
        isReadOnly
        mode="json"
        theme={editorTheme}
        width="100%"
        value={checkBlock.response}
        setOptions={{
          ...editorOptions,
        }}
      />
    </EuiFormRow>
  );
}
