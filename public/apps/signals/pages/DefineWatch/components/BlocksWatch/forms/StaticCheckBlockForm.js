/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiButton, EuiCodeBlock, EuiFormRow } from '@elastic/eui';
import { CheckCodeEditor } from './CheckCodeEditorTest';
import { CheckResponse } from './CheckResponseTest';
import { CheckType } from './CheckType';
import { CheckName } from './CheckName';
import { CheckTarget } from './CheckTarget';
import { ResponseLabelAppend } from './ResponseLabelAppend';
import { EDITOR_OPTIONS } from '../utils/constants';
import { validateJsonString } from '../../../utils/validate';
import { DOC_LINKS, FLYOUTS } from '../../../../../utils/constants';

import { Context } from '../../../../../Context';

function EditorAndResponse({ valuePath, checkBlock, onCloseResult }) {
  return (
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
              labelAppend: <ResponseLabelAppend onClick={onCloseResult} />,
            }}
            editorProps={{
              setOptions: EDITOR_OPTIONS,
            }}
            value={checkBlock.response}
          />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
}
/*
      <EuiFlexItem>
        <CheckResponse value={checkBlock.value} rowProps={{ label: 'value' }} />
      </EuiFlexItem>
      <EuiFlexItem>
        <CheckResponse value={checkBlock.response} rowProps={{ label: 'response' }} />
      </EuiFlexItem>
*/
/*
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
              labelAppend: <ResponseLabelAppend onClick={onCloseResult} />,
            }}
            editorProps={{
              setOptions: EDITOR_OPTIONS,
            }}
            value={checkBlock.response}
          />
        </EuiFlexItem>
      )}
*/

export function StaticCheckBlockForm({ index, values, checkBlock, checksBlocksPath, onCloseResult }) {
  const { triggerFlyout } = useContext(Context);

  const typePath = `${checksBlocksPath}[${index}].type`;
  const namePath = `${checksBlocksPath}[${index}].name`;
  const targetPath = `${checksBlocksPath}[${index}].target`;
  const valuePath = `${checksBlocksPath}[${index}].value`;

  function openEditor() {
    triggerFlyout({
      type: FLYOUTS.CUSTOM,
      payload: {
        flyoutProps: { size: 'l' },
        formikProps: {
          initialValues: values,
          validateOnChange: false,
          enableReinitialize: true,
        },
        body: (
          <EditorAndResponse
            valuePath={valuePath}
            checkBlock={checkBlock}
            onCloseResult={() => onCloseResult(index)}
          />
        ),
        onChange: (values) => {
          console.log('StaticCheckBlockForm, editor flyout, onChange, values', values);
        },
      },
    });
  }

  return (
    <>
      <CheckType typePath={typePath} />
      <CheckName namePath={namePath} />
      <CheckTarget targetPath={targetPath} />

      <EuiSpacer />
      <EuiFormRow label="Value" helpText="Click on the code block to edit.">
        <div onClick={openEditor}>
          <EuiCodeBlock>{checkBlock.value}</EuiCodeBlock>
        </div>
      </EuiFormRow>
    </>
  );
  // return (
  //   <>
  //     <CheckType typePath={typePath} />
  //     <CheckName namePath={namePath} />
  //     <CheckTarget targetPath={targetPath} />
  //     <EuiSpacer />

  //     <EuiFlexGroup>
  //       <EuiFlexItem>
  //         <CheckCodeEditor
  //           formikFieldProps={{
  //             validate: validateJsonString,
  //           }}
  //           editorProps={{
  //             mode: 'json',
  //             setOptions: EDITOR_OPTIONS,
  //           }}
  //           valuePath={valuePath}
  //           docLink={DOC_LINKS.INPUTS.STATIC}
  //         />
  //       </EuiFlexItem>
  //       {checkBlock.response && (
  //         <EuiFlexItem>
  //           <CheckResponse
  //             rowProps={{
  //               labelAppend: <ResponseLabelAppend onClick={() => onCloseResult(index)} />,
  //             }}
  //             editorProps={{
  //               setOptions: EDITOR_OPTIONS,
  //             }}
  //             value={checkBlock.response}
  //           />
  //         </EuiFlexItem>
  //       )}
  //     </EuiFlexGroup>
  //   </>
  // );
}
