/* eslint-disable @kbn/eslint/require-license-header */
/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright 2015-2019 _floragunn_ GmbH
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

import React from 'react';
import PropTypes from 'prop-types';
import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';
import { CodeEditor as CodeEditorSG } from '../../CodeEditor';
import { EuiErrorBoundary } from '@elastic/eui';

const CodeEditor = ({ name, form, field, elementProps: { onBlur, onChange, ...rest } }) => (
  <CodeEditorSG
    id={name}
    value={field.value}
    onChange={
      onChange instanceof Function ? (e, string) => onChange(e, string, field, form) : onChange
    }
    onBlur={onBlur instanceof Function ? e => onBlur(e, field, form) : onBlur}
    {...rest}
  />
);

CodeEditor.propTypes = {
  name: PropTypes.string.isRequired,
  elementProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

const FormikCodeEditorSG = ({
  name,
  formRow = false,
  formikFieldProps = {},
  rowProps = {},
  elementProps = {},
}) => (
  <EuiErrorBoundary>
    <FormikInputWrapper
      name={name}
      formikFieldProps={formikFieldProps}
      render={({ field, form }) => {
        const codeEditor = (
          <CodeEditor name={name} form={form} field={field} elementProps={elementProps} />
        );
        return !formRow ? (
          codeEditor
        ) : (
          <FormikFormRow name={name} form={form} rowProps={rowProps}>
            {codeEditor}
          </FormikFormRow>
        );
      }}
    />
  </EuiErrorBoundary>
);

FormikCodeEditorSG.propTypes = {
  name: PropTypes.string.isRequired,
  formRow: PropTypes.bool,
  formikFieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  elementProps: PropTypes.object,
};

export default FormikCodeEditorSG;
