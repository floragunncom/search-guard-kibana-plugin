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

  // For now hide the checks execution for the action checks. Because it confuses.
  // The SG Elasticsearch plugin API is not ready to send the proper response yet.
  // TODO. Remove the isAction constant usage when the API is ready.
  const isAction = checksBlocksPath.includes('actions');

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
        {checkBlock.response && !isAction && (
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
