import React, { useContext, useRef } from 'react';
import { connect as connectFormik } from 'formik';
import {
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiCodeEditor,
  EuiText,
  EuiLink,
} from '@elastic/eui';
import { FormikCodeEditor } from '../../../../../components';
import { checkText, responseText, closeText } from '../../../../utils/i18n/watch';
import { isInvalid, hasError, validateWatchString } from '../../utils/validate';
import { StaticBlock } from './Views';

import { Context } from '../../../../Context';

const CODE_EDITOR_NUM_OF_LINES = 15;

const GenericBlock = ({ formik: { setFieldValue }, check, idx }) => {
  const { editorTheme, editorOptions } = useContext(Context);

  const renderCheckEditor = idx => (
    <FormikCodeEditor
      data-test-subj={`sgBlocks-checkEditor-block-${idx}`}
      name={`_ui.checksBlocks.${idx}.valueForCodeEditor`}
      formRow
      rowProps={{
        fullWidth: true,
        label: checkText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isCustomMode: true,
        mode: 'watch_editor',
        width: '100%',
        isInvalid,
        setOptions: {
          ...editorOptions,
          minLines: CODE_EDITOR_NUM_OF_LINES,
          maxLines: CODE_EDITOR_NUM_OF_LINES,
          enableLiveAutocompletion: true,
          enableSnippets: true,
        },
        theme: editorTheme,
        onChange: (e, query, field, form) => {
          form.setFieldValue(field.name, query);
        },
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
      }}
      formikFieldProps={{
        validate: validateWatchString,
      }}
    />
  );

  const renderCheckResponse = (response, idx) => {
    return (
      <EuiFormRow
        fullWidth
        label={responseText}
        labelAppend={
          <EuiText
            size="xs"
            onClick={() => {
              setFieldValue(`_ui.checksBlocks[${idx}].response`, '');
            }}
          >
            <EuiLink id="close-response" data-test-subj={`sgBlocks-closeResponse-block-${idx}`}>
              {closeText} X
            </EuiLink>
          </EuiText>
        }
      >
        <EuiCodeEditor
          data-test-subj={`sgBlocks-responseEditor-block-${idx}`}
          width="100%"
          isReadOnly
          theme={editorTheme}
          mode="json"
          setOptions={{
            ...editorOptions,
            minLines: CODE_EDITOR_NUM_OF_LINES,
            maxLines: CODE_EDITOR_NUM_OF_LINES,
          }}
          value={response}
        />
      </EuiFormRow>
    );
  };

  let block;
  switch (check.type) {
    case 'static':
      block = <StaticBlock idx={idx} />;
      break;
    default:
      break;
  }

  return (
    <>
      {block}

      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>{renderCheckEditor(idx)}</EuiFlexItem>
        {check.response && <EuiFlexItem>{renderCheckResponse(check.response, idx)}</EuiFlexItem>}
      </EuiFlexGroup>
    </>
  );
};

export default connectFormik(GenericBlock);
