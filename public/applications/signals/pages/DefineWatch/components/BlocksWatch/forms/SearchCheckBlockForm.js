/* eslint-disable @osd/eslint/require-license-header */
import React, { useContext } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { CheckCodeEditor } from './CheckCodeEditor';
import { CheckType } from './CheckType';
import { CheckName } from './CheckName';
import { CheckTarget } from './CheckTarget';
import { CheckResponse } from './CheckResponse';
import { ResponseLabelAppend } from './ResponseLabelAppend';
import WatchIndex from '../../WatchIndex';
import { EDITOR_OPTIONS } from '../utils/constants';
import { validateJsonString } from '../../../utils/validate';
import { DOC_LINKS } from '../../../../../utils/constants';
import { bodyText } from '../../../../../utils/i18n/watch';

import { Context } from '../../../../../Context';

export function SearchCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const { httpClient } = useContext(Context);

  const typePath = `${checksBlocksPath}[${index}].type`;
  const namePath = `${checksBlocksPath}[${index}].name`;
  const targetPath = `${checksBlocksPath}[${index}].target`;
  const bodyPath = `${checksBlocksPath}[${index}].request.body`;
  const indicesPath = `${checksBlocksPath}[${index}].request.indices`;

  // For now hide the checks execution for the action checks. Because it confuses.
  // The SG Elasticsearch plugin API is not ready to send the proper response yet.
  // TODO. Remove the isAction constant usage when the API is ready.
  const isAction = checksBlocksPath.includes('actions');

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <CheckType typePath={typePath} />
          <CheckName namePath={namePath} />
          <CheckTarget targetPath={targetPath} />
        </EuiFlexItem>
        <EuiFlexItem>
          <WatchIndex httpClient={httpClient} indexFieldName={indicesPath} />
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
              label: bodyText,
            }}
            valuePath={bodyPath}
            docLink={DOC_LINKS.INPUTS.SEARCH_REQUEST}
          />
        </EuiFlexItem>
        {checkBlock.response && !isAction && (
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
