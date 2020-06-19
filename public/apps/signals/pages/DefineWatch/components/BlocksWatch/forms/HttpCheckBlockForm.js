/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { CheckCodeEditor } from './CheckCodeEditor';
import { CheckType } from './CheckType';
import { CheckName } from './CheckName';
import { CheckTarget } from './CheckTarget';
import { CheckResponse } from './CheckResponse';
import { ResponseLabelAppend } from './ResponseLabelAppend';
import { EDITOR_OPTIONS } from '../utils/constants';
import { validateJsonString } from '../../../utils/validate';
import { DOC_LINKS } from '../../../../../utils/constants';
import { requestText } from '../../../../../utils/i18n/watch';

export function HttpCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const typePath = `${checksBlocksPath}[${index}].type`;
  const namePath = `${checksBlocksPath}[${index}].name`;
  const targetPath = `${checksBlocksPath}[${index}].target`;
  const requestPath = `${checksBlocksPath}[${index}].request`;
  const tlsPath = `${checksBlocksPath}[${index}].tls`;

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <CheckType typePath={typePath} />
          <CheckName namePath={namePath} />
          <CheckTarget targetPath={targetPath} />
        </EuiFlexItem>
        <EuiFlexItem>
          <CheckCodeEditor
            editorProps={{
              mode: 'json',
              setOptions: EDITOR_OPTIONS,
            }}
            rowProps={{
              label: 'TLS',
            }}
            valuePath={tlsPath}
            docLink={DOC_LINKS.INPUTS.HTTP}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />

      <EuiFlexGroup>
        <EuiFlexItem>
          <CheckCodeEditor
            formikFieldProps={{
              validate: validateJsonString,
            }}
            editorProps={{
              mode: 'json',
              setOptions: EDITOR_OPTIONS,
            }}
            rowProps={{
              label: requestText,
            }}
            valuePath={requestPath}
            docLink={DOC_LINKS.INPUTS.HTTP}
          />
        </EuiFlexItem>
        {checkBlock.response && (
          <EuiFlexItem>
            <CheckResponse
              value={checkBlock.response}
              rowProps={{
                labelAppend: <ResponseLabelAppend onClick={() => onCloseResult(index)} />,
              }}
              editorProps={{
                setOptions: EDITOR_OPTIONS,
              }}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  );
}
