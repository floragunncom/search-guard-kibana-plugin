/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { EuiText, EuiLink } from '@elastic/eui';
import { FormikCodeEditor } from '../../../../../components';
import { isInvalid, hasError, validateWatchString } from '../../../utils/validate';
import { valueText, documentationText } from '../../../../../utils/i18n/watch';

import { Context } from '../../../../../Context';

export function CheckCodeEditor({ editorOptions, valuePath, docLink }) {
  const { editorTheme, editorOptions: defaultEditorOptions } = useContext(Context);

  return (
    <FormikCodeEditor
      name={valuePath}
      formRow
      rowProps={{
        fullWidth: true,
        label: valueText,
        isInvalid,
        error: hasError,
        labelAppend: (
          <EuiText size="xs">
            <EuiLink href={docLink} target="_blank">
              {documentationText}
            </EuiLink>
          </EuiText>
        ),
      }}
      elementProps={{
        isCustomMode: false,
        mode: 'json',
        width: '100%',
        isInvalid,
        setOptions: {
          ...defaultEditorOptions,
          ...editorOptions,
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
        validate: validateWatchString,
      }}
    />
  );
}
