import React from 'react';
import chrome from 'ui/chrome';
import PropTypes from 'prop-types';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiHorizontalRule
} from '@elastic/eui';
import { FormikCodeEditor } from '../../../../components';
import { hasError, isInvalid, validateWatchString } from '../../utils/validate';
import { checksText } from '../../../../utils/i18n/watch';
import { CODE_EDITOR } from '../../../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
const { darkTheme, ...setOptions } = CODE_EDITOR;
let { theme } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const Header = ({ actions }) => (
  <>
    <EuiFlexGroup
      justifyContent="spaceBetween"
      alignItems="center"
    >
      <EuiFlexItem>
        <EuiTitle size="xs">
          <h4>{checksText}</h4>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup
          justifyContent="spaceBetween"
          alignItems="center"
        >
          {
            Array.isArray(actions)
              ? actions.map((action, i) => <EuiFlexItem key={i}>{action}</EuiFlexItem>)
              : <EuiFlexItem>{actions}</EuiFlexItem>
          }
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiHorizontalRule margin="s" />
  </>
);

const CodeEditor = ({
  checksPath,
  insertCheckTemplate,
  onChange
}) => (
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
        enableSnippets: true
      },
      isCustomMode: true,
      mode: 'watch_editor',
      width: '100%',
      height: '500px',
      theme,
      insertText: insertCheckTemplate,
      onChange: (e, query, field, form) => {
        form.setFieldValue(field.name, query);
        if (typeof onChange === 'function') {
          onChange(e.end);
        }
      },
      onBlur: (e, field, form) => {
        form.setFieldTouched(field.name, true);
      },
    }}
    formikFieldProps={{
      validate: validateWatchString
    }}
  />
);

// TODO: add inserCheckTemplate
const JsonChecksForm = ({
  isHeader,
  checksPath,
  actions,
  children,
  insertCheckTemplate,
  onChange
}) => {
  return (
    <>
      {isHeader && <Header actions={actions} />}
      <CodeEditor
        checksPath={checksPath}
        onChange={onChange}
        insertCheckTemplate={insertCheckTemplate}
      />
      {children && <div>{children}</div>}
    </>
  );
};

JsonChecksForm.defaultProps = {
  isHeader: false
};

JsonChecksForm.propTypes = {
  isHeder: PropTypes.bool,
  checksPath: PropTypes.string.isRequired,
  actions: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf([PropTypes.node])
  ]),
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf([PropTypes.node])
  ]),
  insertCheckTemplate: PropTypes.shape({
    row: PropTypes.number,
    column: PropTypes.column,
    text: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

export default JsonChecksForm;
