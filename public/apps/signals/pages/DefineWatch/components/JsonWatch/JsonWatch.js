import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiCodeEditor,
  EuiText,
  EuiLink,
} from '@elastic/eui';
import { FormikCodeEditor } from '../../../../components';
import { hasError, isInvalid, validateWatchString } from '../../utils/validate';
import { checksText } from '../../../../utils/i18n/watch';
import { closeText, responseText } from '../../../../utils/i18n/common';

import { Context } from '../../../../Context';

const JsonWatch = ({
  onCloseResult,
  editorResult,
  isResultVisible,
  templateToInsert,
  onCursorPositionUpdate,
  checksPath,
}) => {
  const { editorTheme, editorOptions } = useContext(Context);

  const renderChecksEditor = () => {
    const props = {};

    if (templateToInsert) {
      props.insertText = templateToInsert;
    }

    return (
      <FormikCodeEditor
        name={checksPath}
        formRow
        rowProps={{
          label: checksText,
          fullWidth: true,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
          setOptions: {
            ...editorOptions,
            enableLiveAutocompletion: true,
            enableSnippets: true,
          },
          isCustomMode: true,
          mode: 'watch_editor',
          width: '100%',
          height: '500px',
          theme: editorTheme,
          ...props,
          onChange: (e, query, field, form) => {
            form.setFieldValue(field.name, query);
            if (typeof onCursorPositionUpdate === 'function') {
              onCursorPositionUpdate(e.end);
            }
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
  };

  const renderChecksResponse = () => (
    <EuiFlexItem>
      <EuiFormRow
        fullWidth
        label={responseText}
        labelAppend={
          <EuiText size="xs" onClick={onCloseResult}>
            <EuiLink id="close-response" data-test-subj="sgWatch-CloseResponse">
              {closeText} X
            </EuiLink>
          </EuiText>
        }
      >
        <EuiCodeEditor
          theme={editorTheme}
          mode="json"
          width="100%"
          height="500px"
          value={editorResult}
          readOnly
        />
      </EuiFormRow>
    </EuiFlexItem>
  );

  return (
    <EuiFlexGroup>
      <EuiFlexItem>{renderChecksEditor()}</EuiFlexItem>
      {isResultVisible && renderChecksResponse()}
    </EuiFlexGroup>
  );
};

JsonWatch.defaultProps = {
  isResultVisible: false,
  checksPath: 'checks',
};

JsonWatch.propTypes = {
  onCloseResult: PropTypes.func.isRequired,
  editorResult: PropTypes.string,
  isResultVisible: PropTypes.bool,
  templateToInsert: PropTypes.shape({
    text: PropTypes.string,
    row: PropTypes.number,
    column: PropTypes.number,
  }),
  onCursorPositionUpdate: PropTypes.func,
  checksPath: PropTypes.string,
};

export default JsonWatch;
