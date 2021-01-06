/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
                <EuiCodeEditor
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
