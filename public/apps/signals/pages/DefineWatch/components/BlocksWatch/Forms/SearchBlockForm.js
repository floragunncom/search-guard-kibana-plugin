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
  valueText,
  documentationText,
  elasticsearchQueryDSLText,
} from '../../../../../utils/i18n/watch';
import WatchIndex from '../../WatchIndex';
import { isInvalid, hasError, validateEmptyField } from '../../../utils/validate';
import { CODE_EDITOR_NUM_OF_LINES } from '../utils/constants';
import { DOC_LINKS } from '../../../../../utils/constants';

import { Context } from '../../../../../Context';

const SearchBlock = ({ idx, block, formik: { setFieldValue } }) => {
  const {
    editorTheme,
    editorOptions,
    httpClient,
    onComboBoxChange,
    onComboBoxOnBlur,
    onComboBoxCreateOption,
  } = useContext(Context);

  const renderCheckEditor = idx => (
    <FormikCodeEditor
      data-test-subj={`sgBlocks-checkEditor-block-${idx}`}
      name={`_ui.checksBlocks.${idx}.request.body`}
      formRow
      rowProps={{
        fullWidth: true,
        label: elasticsearchQueryDSLText,
        isInvalid,
        error: hasError,
        labelAppend: (
          <EuiText size="xs">
            <EuiLink data-test-subj="document-link" href={DOC_LINKS.INPUTS.SEARCH} target="_blank">
              {documentationText}
            </EuiLink>
          </EuiText>
        ),
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

      <WatchIndex
        isClearable={false}
        httpClient={httpClient}
        indexFieldName={`_ui.checksBlocks[${idx}].request.indices`}
        onComboBoxChange={onComboBoxChange}
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />

      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>{renderCheckEditor(idx)}</EuiFlexItem>
        {block.response && <EuiFlexItem>{renderCheckResponse(block.response, idx)}</EuiFlexItem>}
      </EuiFlexGroup>
    </>
  );
};

SearchBlock.propTypes = {
  idx: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  block: PropTypes.shape({
    type: PropTypes.oneOf(['search']).isRequired,
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    response: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    request: PropTypes.shape({
      indices: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
        })
      ).isRequired,
      body: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

export default connectFormik(SearchBlock);
