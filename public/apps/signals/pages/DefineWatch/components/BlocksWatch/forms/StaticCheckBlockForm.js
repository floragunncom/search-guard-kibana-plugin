/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { CheckCodeEditor } from './CheckCodeEditor';
import { CheckType } from './CheckType';
import { CheckName } from './CheckName';
import { CheckTarget } from './CheckTarget';
import { CheckResponse } from './CheckResponse';
import { EDITOR_OPTIONS } from '../utils/constants';
import { DOC_LINKS } from '../../../../../utils/constants';

import { Context } from '../../../../../Context';

export function StaticCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const { editorTheme, editorOptions } = useContext(Context);

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
            editorOptions={{ ...editorOptions, ...EDITOR_OPTIONS }}
            valuePath={valuePath}
            docLink={DOC_LINKS.INPUTS.STATIC}
          />
        </EuiFlexItem>
        {checkBlock.response && (
          <EuiFlexItem>
            <CheckResponse
              index={index}
              editorOptions={{ ...editorOptions, ...EDITOR_OPTIONS }}
              checkBlock={checkBlock}
              onCloseResult={onCloseResult}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  );
}
