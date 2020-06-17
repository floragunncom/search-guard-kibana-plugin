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
import { validateJsonString } from '../../../utils/validate';
import { DOC_LINKS } from '../../../../../utils/constants';
import { requestText } from '../../../../../utils/i18n/watch';

import { Context } from '../../../../../Context';

export function SearchCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const { editorOptions } = useContext(Context);

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
            mode="json"
            rowLabel={requestText}
            editorOptions={{ ...editorOptions, ...EDITOR_OPTIONS }}
            valuePath={valuePath}
            docLink={DOC_LINKS.INPUTS.SEARCH_REQUEST}
            validateFn={validateJsonString}
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
