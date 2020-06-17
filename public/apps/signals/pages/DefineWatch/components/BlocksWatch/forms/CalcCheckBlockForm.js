/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { CheckCodeEditor } from './CheckCodeEditor';
import { CheckType } from './CheckType';
import { CheckName } from './CheckName';
import { CheckTarget } from './CheckTarget';
import { CheckResponse } from './CheckResponse';
import { ResponseLabelAppend } from './ResponseLabelAppend';
import { EDITOR_OPTIONS } from '../utils/constants';
import { validateEmptyField } from '../../../utils/validate';
import { DOC_LINKS } from '../../../../../utils/constants';

import { Context } from '../../../../../Context';

export function CalcCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const { editorOptions } = useContext(Context);

  const typePath = `${checksBlocksPath}[${index}].type`;
  const namePath = `${checksBlocksPath}[${index}].name`;
  const targetPath = `${checksBlocksPath}[${index}].target`;
  const valuePath = `${checksBlocksPath}[${index}].source`;

  return (
    <>
      <CheckType typePath={typePath} />
      <CheckName namePath={namePath} />
      <CheckTarget targetPath={targetPath} />
      <EuiSpacer />

      <EuiFlexGroup>
        <EuiFlexItem>
          <CheckCodeEditor
            mode="text"
            editorOptions={{ ...editorOptions, ...EDITOR_OPTIONS }}
            valuePath={valuePath}
            docLink={DOC_LINKS.CONDITIONS}
            validateFn={validateEmptyField}
          />
        </EuiFlexItem>
        {checkBlock.response && (
          <EuiFlexItem>
            <CheckResponse
              editorOptions={{ ...editorOptions, ...EDITOR_OPTIONS }}
              value={checkBlock.response}
              labelAppend={<ResponseLabelAppend onClick={() => onCloseResult(index)} />}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  );
}
