import React from 'react';
import chrome from 'ui/chrome';
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
import { CODE_EDITOR } from '../../../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
let { theme, darkTheme, ...setOptions } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const JsonWatch = ({
  onCloseResult,
  editorResult,
  isResultVisible,
  templateToInsert,
  onCursorPositionUpdate,
  checksPath,
}) => {
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
            ...setOptions,
            enableLiveAutocompletion: true,
            enableSnippets: true,
          },
          isCustomMode: true,
          mode: 'watch_editor',
          width: '100%',
          height: '500px',
          theme,
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
          theme="github"
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
