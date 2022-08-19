/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { EuiFormRow, EuiText, EuiLink, EuiCodeEditor, EuiSpacer } from '@elastic/eui';
import { responseText, closeText } from '../../../../../utils/i18n/watch';
import QueryStat from '../../QueryStat';
import {CodeEditor} from "../../../../../../components";

export function WatchResponse({ onCloseResult, editorTheme, editorResult }) {
  return (
    <>
      <EuiFormRow
        fullWidth
        label={responseText}
        labelAppend={
          <EuiText size="xs" onClick={onCloseResult}>
            <EuiLink id="close-response" data-test-subj="sgWatch-CloseResponse">
              {closeText} X
            </EuiLink>
          </EuiText>
        }
      >
        <CodeEditor
          theme={editorTheme}
          mode="json"
          width="100%"
          height="500px"
          value={editorResult}
          readOnly
        />
      </EuiFormRow>

      <EuiSpacer />
      <QueryStat />
    </>
  );
}
