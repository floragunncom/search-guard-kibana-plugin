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

export function StaticCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const typePath = `${checksBlocksPath}[${index}].type`;
  const namePath = `${checksBlocksPath}[${index}].name`;
  const targetPath = `${checksBlocksPath}[${index}].target`;
  const valuePath = `${checksBlocksPath}[${index}].value`;

  return (
    <>
      <CheckType typePath={typePath} />
      <CheckName namePath={namePath} />
      <CheckTarget targetPath={targetPath} />
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
            valuePath={valuePath}
            docLink={DOC_LINKS.INPUTS.STATIC}
          />
        </EuiFlexItem>
        {checkBlock.response && (
          <EuiFlexItem>
            <CheckResponse
              rowProps={{
                labelAppend: <ResponseLabelAppend onClick={() => onCloseResult(index)} />,
              }}
              editorProps={{
                setOptions: EDITOR_OPTIONS,
              }}
              value={checkBlock.response}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  );
}
