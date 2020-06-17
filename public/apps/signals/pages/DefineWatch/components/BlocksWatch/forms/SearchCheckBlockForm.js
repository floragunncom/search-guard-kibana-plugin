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

export function SearchCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const typePath = `${checksBlocksPath}[${index}].type`;
  const namePath = `${checksBlocksPath}[${index}].name`;
  const targetPath = `${checksBlocksPath}[${index}].target`;
  const valuePath = `${checksBlocksPath}[${index}].request`;

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
            rowProps={{
              label: requestText,
            }}
            valuePath={valuePath}
            docLink={DOC_LINKS.INPUTS.SEARCH_REQUEST}
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
