/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import PropTypes from 'prop-types';
import { EuiCodeEditor, EuiFormRow } from '@elastic/eui';
import { responseText } from '../../../../../utils/i18n/watch';

export function CheckResponse({ value, rowProps, editorProps = {} }) {
  const { setOptions = {}, ...restEditorProps } = editorProps;

  return (
    <EuiFormRow fullWidth {...rowProps}>
      <EuiCodeEditor
        isReadOnly
        mode="json"
        // theme={editorTheme}
        width="100%"
        value={value}
        setOptions={{
          ...setOptions,
        }}
        {...restEditorProps}
      />
    </EuiFormRow>
  );
}

CheckResponse.defultProps = {
  rowProps: {
    label: responseText,
  },
  editorProps: {
    setOptions: {},
  },
};

CheckResponse.protoTypes = {
  value: PropTypes.string.isRequired,
  rowProps: PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    labelAppend: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  }),
  editorProps: PropTypes.shape({
    setOptions: PropTypes.object,
  }),
};
