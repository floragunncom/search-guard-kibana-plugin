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
import {
  targetText,
  nameText,
  responseText,
  closeText,
  bodyText,
  documentationText,
} from '../../../../../utils/i18n/watch';
import { isInvalid, hasError, validateEmptyField } from '../../../utils/validate';
import { CODE_EDITOR_NUM_OF_LINES } from '../utils/constants';
import { DOC_LINKS } from '../../../../../utils/constants';
import { HttpBlock, REQUEST_METHODS, REQUEST_AUTH_TYPES } from '../utils/Blocks/HttpBlock';

import { Context } from '../../../../../Context';

const HttpBlockForm = ({ idx, block, formik: { setFieldValue } }) => {
  const { editorTheme, editorOptions } = useContext(Context);

  const renderCheckEditor = idx => (
    <FormikCodeEditor
      data-test-subj={`sgBlocks-checkEditor-block-${idx}`}
      name={`_ui.checksBlocks.${idx}.body`}
      formRow
      rowProps={{
        fullWidth: true,
        label: bodyText,
        isInvalid,
        error: hasError,
        labelAppend: (
          <EuiText size="xs">
            <EuiLink data-test-subj="document-link" href={DOC_LINKS.INPUTS.HTTP} target="_blank">
              {documentationText}
            </EuiLink>
          </EuiText>
        ),
      }}
      elementProps={{
        isCustomMode: false,
        mode: 'text',
        width: '100%',
        isInvalid,
        setOptions: {
          ...editorOptions,
          minLines: CODE_EDITOR_NUM_OF_LINES,
          maxLines: CODE_EDITOR_NUM_OF_LINES,
        },
        theme: editorTheme,
        onChange: (e, query, field, form) => {
          form.setFieldValue(field.name, query);
        },
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
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

  return (
    <>
      <FormikFieldText
        name={`_ui.checksBlocks[${idx}].name`}
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
        name={`_ui.checksBlocks[${idx}].target`}
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

HttpBlockForm.propTypes = {
  idx: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  block: PropTypes.shape({
    type: PropTypes.oneOf([HttpBlock.type]).isRequired,
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    response: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    request: PropTypes.shape({
      url: PropTypes.string.isRequired,
      method: PropTypes.oneOfType(REQUEST_METHODS),
      headers: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      connection_timeout: PropTypes.number.isRequired,
      read_timeout: PropTypes.number.isRequired,
      path: PropTypes.string.isRequired,
      query_params: PropTypes.string.isRequired,
      auth: PropTypes.shape({
        type: PropTypes.oneOf(REQUEST_AUTH_TYPES).isRequired,
        username: PropTypes.string.isRequired,
        password: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    tls: PropTypes.shape({
      client_auth: PropTypes.shape({
        certs: PropTypes.string.isRequired,
        private_key: PropTypes.string.isRequired,
        private_key_password: PropTypes.string.isRequired,
      }),
      trust_all: PropTypes.bool.isRequired,
      trusted_certs: PropTypes.string.isRequired,
      verify_hostnames: PropTypes.bool.isRequired,
    }),
  }).isRequired,
};

export default connectFormik(HttpBlockForm);
