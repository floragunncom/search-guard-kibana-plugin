
/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { connect as connectFormik } from 'formik';
import { EuiCodeEditor, EuiFormRow, EuiLink, EuiErrorBoundary } from '@elastic/eui';
import { FLYOUTS } from '../../../../utils/constants';
import { getChecksExecutionResponse } from './helpers';
import {
  responseText,
  mustacheText,
  runtimeDataText,
  optionalText,
  rowHelpTextMustacheRuntimeDataFieldText,
} from '../../../../utils/i18n/watch';

import { Context } from '../../../../Context';
import {CodeEditor} from "../../../../../components";

function ResultsFlyout({ value }) {
  const { editorTheme, triggerFlyout } = useContext(Context);

  return (
    <EuiLink
      onClick={() => {
        triggerFlyout({
          type: FLYOUTS.CUSTOM,
          payload: {
            title: runtimeDataText(true),
            body: (
              <EuiFormRow fullWidth label={responseText}>
                <CodeEditor
                  theme={editorTheme}
                  mode="json"
                  width="100%"
                  height="500px"
                  value={value}
                  readOnly
                />
              </EuiFormRow>
            ),
          },
        });
      }}
    >
      {runtimeDataText()}
    </EuiLink>
  );
}

function RowHelpTextMustacheRuntimeDataField({
  formik: { values },
  checksResult = '',
  isOptional = false,
  isHTML = false,
} = {}) {
  const results = getChecksExecutionResponse(values, checksResult);

  const runtimeDataLink = <ResultsFlyout value={results} />;

  const mustacheLink = (
    <EuiLink href="https://mustache.github.io/" target="_blank">
      {mustacheText}
    </EuiLink>
  );

  const htmlLink = !isHTML ? undefined : (
    <EuiLink href="https://developer.mozilla.org/en-US/docs/Web/HTML" target="_blank">
      HTML
    </EuiLink>
  );

  let label = null;

  if (isOptional) {
    label = (
      <>
        {optionalText}.{' '}
        {rowHelpTextMustacheRuntimeDataFieldText(runtimeDataLink, mustacheLink, htmlLink)}
      </>
    );
  } else {
    label = rowHelpTextMustacheRuntimeDataFieldText(runtimeDataLink, mustacheLink, htmlLink);
  }

  return <EuiErrorBoundary>{label}</EuiErrorBoundary>;
}

export default connectFormik(RowHelpTextMustacheRuntimeDataField);
