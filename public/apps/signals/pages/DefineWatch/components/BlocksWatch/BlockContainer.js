import React, { useContext, useRef } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
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
import { StaticBlock } from './utils/Blocks';
import { StaticBlockForm } from './Forms';

import { Context } from '../../../../Context';

const CODE_EDITOR_NUM_OF_LINES = 15;

const BlockContainer = ({ formik: { setFieldValue }, block, idx }) => {
  const { editorTheme, editorOptions } = useContext(Context);

  const renderCheckEditor = idx => (
    <FormikCodeEditor
      data-test-subj={`sgBlocks-checkEditor-block-${idx}`}
      name={`_ui.checksBlocks.${idx}.value`}
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

  let form;
  switch (block.type) {
    case StaticBlock.type:
      form = <StaticBlockForm idx={idx} />;
      break;
    default:
      break;
  }

  return (
    <>
      {form}

      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>{renderCheckEditor(idx)}</EuiFlexItem>
        {block.response && <EuiFlexItem>{renderCheckResponse(block.response, idx)}</EuiFlexItem>}
      </EuiFlexGroup>
    </>
  );
};

BlockContainer.propTypes = {
  formik: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  block: PropTypes.oneOfType([PropTypes.object]),
};

export default connectFormik(BlockContainer);
