/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { EuiCodeEditor, EuiFormRow } from '@elastic/eui';
import { responseText } from '../../../../../utils/i18n/watch';

import { Context } from '../../../../../Context';
import {CodeEditor} from "../../../../../../components";

export function CheckResponse({ value = '', rowProps = {}, editorProps = {} } = {}) {
  const { editorTheme, editorOptions: defaultEditorOptions } = useContext(Context);

  const { setOptions = {}, ...restEditorProps } = editorProps;

  return (
    <EuiFormRow fullWidth label={responseText} {...rowProps}>
      <CodeEditor
        isReadOnly
        mode="json"
        theme={editorTheme}
        width="100%"
        value={value}
        setOptions={{
          ...defaultEditorOptions,
          ...setOptions,
        }}
        {...restEditorProps}
      />
    </EuiFormRow>
  );
}

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
