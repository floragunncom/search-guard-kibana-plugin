/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { EuiCodeEditor, EuiFormRow } from '@elastic/eui';
import { responseText } from '../../../../../utils/i18n/watch';

import { Context } from '../../../../../Context';

// TODO: refactor to pass props objects instead of individual props
export function CheckResponse({ editorOptions, value, labelAppend }) {
  const { editorTheme, editorOptions: defaultEditorOptions } = useContext(Context);

  const formRowProps = {};

  if (labelAppend) {
    formRowProps.labelAppend = labelAppend;
  }

  return (
    <EuiFormRow fullWidth label={responseText} {...formRowProps}>
      <EuiCodeEditor
        isReadOnly
        mode="json"
        theme={editorTheme}
        width="100%"
        value={value}
        setOptions={{
          ...defaultEditorOptions,
          ...editorOptions,
        }}
      />
    </EuiFormRow>
  );
}

CheckResponse.propTypes = {
  value: PropTypes.string.isRequired,
  editorOptions: PropTypes.object,
  labelAppend: PropTypes.node,
};
