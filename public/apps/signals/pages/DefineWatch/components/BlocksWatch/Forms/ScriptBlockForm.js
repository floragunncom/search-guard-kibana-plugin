/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
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
import { FormikCodeEditor, FormikFieldText } from '../../../../../components';
import { ConditionBlock, TransformBlock, CalcBlock } from '../utils/Blocks';
import {
  targetText,
  nameText,
  responseText,
  closeText,
  sourceText,
  documentationText,
} from '../../../../../utils/i18n/watch';
import { isInvalid, hasError, validateEmptyField } from '../../../utils/validate';
import { CODE_EDITOR_NUM_OF_LINES } from '../utils/constants';
import { DOC_LINKS } from '../../../../../utils/constants';

import { Context } from '../../../../../Context';

const ScriptBlockForm = ({ idx, block, checksBlocksPath, formik: { setFieldValue } }) => {
  const { editorTheme, editorOptions } = useContext(Context);

  const sourcePath = `${checksBlocksPath}[${idx}].source`;
  const responsePath = `${checksBlocksPath}[${idx}].response`;
  const namePath = `${checksBlocksPath}[${idx}].name`;
  const targetPath = `${checksBlocksPath}[${idx}].target`;

  let docLink = DOC_LINKS.GETTING_STARTED;
  if (block.type === TransformBlock.type) {
    docLink = DOC_LINKS.TRANSFORMS;
  } else if (block.type === CalcBlock.type) {
    docLink = DOC_LINKS.CALCS;
  } else if (block.type === ConditionBlock.type || block.type === ConditionBlock.legacyType) {
    docLink = DOC_LINKS.CONDITIONS;
  }

  const renderCheckEditor = idx => (
    <FormikCodeEditor
      data-test-subj={`sgBlocks-checkEditor-block-${idx}`}
      name={sourcePath}
      formRow
      rowProps={{
        fullWidth: true,
        label: sourceText,
        isInvalid,
        error: hasError,
        labelAppend: (
          <EuiText size="xs">
            <EuiLink data-test-subj="document-link" href={docLink} target="_blank">
              {documentationText}
            </EuiLink>
          </EuiText>
        ),
      }}
      elementProps={{
        // TODO: develop a custom mode to support painless
        isCustomMode: false,
        mode: 'text',
        width: '100%',
        isInvalid,
        setOptions: {
          ...editorOptions,
          minLines: CODE_EDITOR_NUM_OF_LINES,
          maxLines: CODE_EDITOR_NUM_OF_LINES,
          // TODO: add snippets and autocomplition when painless mode is ready to use
          enableLiveAutocompletion: false,
          enableSnippets: false,
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
        validate: validateEmptyField,
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
              setFieldValue(responsePath, '');
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

  return (
    <>
      <FormikFieldText
        name={namePath}
        formRow
        rowProps={{
          label: nameText,
        }}
        elementProps={{
          onFocus: (e, field, form) => {
            form.setFieldError(field.name, undefined);
          },
        }}
      />
      <FormikFieldText
        name={targetPath}
        formRow
        rowProps={{
          label: targetText,
        }}
        elementProps={{
          onFocus: (e, field, form) => {
            form.setFieldError(field.name, undefined);
          },
        }}
      />

      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>{renderCheckEditor(idx)}</EuiFlexItem>
        {block.response && <EuiFlexItem>{renderCheckResponse(block.response, idx)}</EuiFlexItem>}
      </EuiFlexGroup>
    </>
  );
};

ScriptBlockForm.propTypes = {
  checksBlocksPath: PropTypes.string.isRequired,
  idx: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  block: PropTypes.shape({
    type: PropTypes.oneOf([
      ConditionBlock.type,
      ConditionBlock.legacyType,
      TransformBlock.type,
      CalcBlock.type,
    ]).isRequired,
    name: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    response: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
  }).isRequired,
};

export default connectFormik(ScriptBlockForm);
